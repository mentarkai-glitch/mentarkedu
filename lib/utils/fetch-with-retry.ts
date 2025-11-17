import * as Sentry from "@sentry/nextjs";

type RetryOptions = {
  attempts?: number;
  backoffMs?: number;
  timeout?: number; // Timeout in milliseconds
  onRetry?: (error: unknown, attempt: number) => void;
};

const DEFAULT_ATTEMPTS = 2;
const DEFAULT_BACKOFF_MS = 400;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const attempts = retryOptions.attempts ?? DEFAULT_ATTEMPTS;
  const backoffMs = retryOptions.backoffMs ?? DEFAULT_BACKOFF_MS;
  const timeout = retryOptions.timeout;

  // Safety check: Never retry localhost connections in production
  const urlString = typeof input === 'string' ? input : input.toString();
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  if (isProduction && (urlString.includes('localhost') || urlString.includes('127.0.0.1'))) {
    throw new Error('Cannot connect to localhost in production environment');
  }

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= attempts) {
    try {
      // Create abort controller for timeout if specified
      const controller = timeout ? new AbortController() : null;
      const timeoutId = timeout ? setTimeout(() => controller?.abort(), timeout) : null;

      try {
        const response = await fetch(input, {
          ...init,
          signal: controller?.signal || init?.signal,
        });
        
        if (timeoutId) clearTimeout(timeoutId);
        
        if (!response.ok && attempt < attempts) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response;
      } catch (fetchError: any) {
        if (timeoutId) clearTimeout(timeoutId);
        
        // Check if it's an abort error (timeout)
        if (fetchError?.name === 'AbortError' || controller?.signal?.aborted) {
          throw new Error(`Request timed out after ${timeout}ms`);
        }
        throw fetchError;
      }
    } catch (error) {
      lastError = error;
      if (retryOptions.onRetry) {
        retryOptions.onRetry(error, attempt);
      }
      if (attempt === attempts) {
        // Only log to Sentry if it's not a connection refused error (expected when service unavailable)
        const isConnectionError = error instanceof Error && (
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('fetch failed') ||
          error.message.includes('network')
        );
        
        if (!isConnectionError && typeof Sentry.captureException === "function") {
          Sentry.captureException(error, {
            tags: { retry_exhausted: "true" },
            extra: { url: input.toString(), attempts: attempts + 1 },
          });
        }
        break;
      }
      await sleep(backoffMs * (attempt + 1));
      attempt += 1;
    }
  }

  throw lastError ?? new Error("Request failed after retries");
}


