import * as Sentry from "@sentry/nextjs";

type RetryOptions = {
  attempts?: number;
  backoffMs?: number;
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

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= attempts) {
    try {
      const response = await fetch(input, init);
      if (!response.ok && attempt < attempts) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (retryOptions.onRetry) {
        retryOptions.onRetry(error, attempt);
      }
      if (attempt === attempts) {
        if (typeof Sentry.captureException === "function") {
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


