/**
 * Enhanced Error Handling with Categories, Retry Logic, and Recovery Strategies
 */

import * as Sentry from "@sentry/nextjs";

export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  NOT_FOUND = "not_found",
  RATE_LIMIT = "rate_limit",
  NETWORK = "network",
  DATABASE = "database",
  EXTERNAL_API = "external_api",
  PAYMENT = "payment",
  INTERNAL = "internal",
  TIMEOUT = "timeout",
}

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  body?: any;
  query?: any;
  userAgent?: string;
  ip?: string;
  additionalData?: Record<string, any>;
}

export interface EnhancedError extends Error {
  category: ErrorCategory;
  severity: ErrorSeverity;
  statusCode: number;
  code?: string;
  retryable: boolean;
  context?: ErrorContext;
  timestamp: string;
  originalError?: Error;
}

export class ApiError extends Error implements EnhancedError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  statusCode: number;
  code?: string;
  retryable: boolean;
  context?: ErrorContext;
  timestamp: string;
  originalError?: Error;

  constructor(
    message: string,
    category: ErrorCategory = ErrorCategory.INTERNAL,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    statusCode: number = 500,
    options?: {
      code?: string;
      retryable?: boolean;
      context?: ErrorContext;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = "ApiError";
    this.category = category;
    this.severity = severity;
    this.statusCode = statusCode;
    this.code = options?.code;
    this.retryable = options?.retryable ?? false;
    this.context = options?.context;
    this.timestamp = new Date().toISOString();
    this.originalError = options?.originalError;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      statusCode: this.statusCode,
      code: this.code,
      retryable: this.retryable,
      timestamp: this.timestamp,
      ...(this.context && { context: this.context }),
    };
  }
}

/**
 * Create categorized errors from common error types
 */
export function createError(
  message: string,
  category: ErrorCategory,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  options?: {
    statusCode?: number;
    code?: string;
    retryable?: boolean;
    context?: ErrorContext;
    originalError?: Error;
  }
): ApiError {
  const statusCodeMap: Record<ErrorCategory, number> = {
    [ErrorCategory.AUTHENTICATION]: 401,
    [ErrorCategory.AUTHORIZATION]: 403,
    [ErrorCategory.VALIDATION]: 400,
    [ErrorCategory.NOT_FOUND]: 404,
    [ErrorCategory.RATE_LIMIT]: 429,
    [ErrorCategory.NETWORK]: 502,
    [ErrorCategory.DATABASE]: 500,
    [ErrorCategory.EXTERNAL_API]: 502,
    [ErrorCategory.PAYMENT]: 402,
    [ErrorCategory.INTERNAL]: 500,
    [ErrorCategory.TIMEOUT]: 504,
  };

  const retryableMap: Record<ErrorCategory, boolean> = {
    [ErrorCategory.AUTHENTICATION]: false,
    [ErrorCategory.AUTHORIZATION]: false,
    [ErrorCategory.VALIDATION]: false,
    [ErrorCategory.NOT_FOUND]: false,
    [ErrorCategory.RATE_LIMIT]: true,
    [ErrorCategory.NETWORK]: true,
    [ErrorCategory.DATABASE]: true,
    [ErrorCategory.EXTERNAL_API]: true,
    [ErrorCategory.PAYMENT]: false,
    [ErrorCategory.INTERNAL]: false,
    [ErrorCategory.TIMEOUT]: true,
  };

  return new ApiError(
    message,
    category,
    severity,
    options?.statusCode ?? statusCodeMap[category],
    {
      code: options?.code,
      retryable: options?.retryable ?? retryableMap[category],
      context: options?.context,
      originalError: options?.originalError,
    }
  );
}

/**
 * Parse error and convert to ApiError
 */
export function parseError(error: unknown, context?: ErrorContext): ApiError {
  if (error instanceof ApiError) {
    if (context) {
      error.context = { ...error.context, ...context };
    }
    return error;
  }

  if (error instanceof Error) {
    // Parse common error patterns
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes("fetch failed") || message.includes("network")) {
      return createError(
        "Network connection failed",
        ErrorCategory.NETWORK,
        ErrorSeverity.MEDIUM,
        { retryable: true, context, originalError: error }
      );
    }

    // Timeout errors
    if (message.includes("timeout") || message.includes("timed out")) {
      return createError(
        "Request timed out",
        ErrorCategory.TIMEOUT,
        ErrorSeverity.MEDIUM,
        { retryable: true, context, originalError: error }
      );
    }

    // Database errors
    if (message.includes("database") || message.includes("sql") || message.includes("connection")) {
      return createError(
        "Database operation failed",
        ErrorCategory.DATABASE,
        ErrorSeverity.HIGH,
        { retryable: true, context, originalError: error }
      );
    }

    // Validation errors
    if (message.includes("validation") || message.includes("invalid") || message.includes("required")) {
      return createError(
        error.message,
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        { statusCode: 400, context, originalError: error }
      );
    }

    // Not found errors
    if (message.includes("not found") || message.includes("does not exist")) {
      return createError(
        "Resource not found",
        ErrorCategory.NOT_FOUND,
        ErrorSeverity.LOW,
        { statusCode: 404, context, originalError: error }
      );
    }

    // Rate limit errors
    if (message.includes("rate limit") || message.includes("too many requests")) {
      return createError(
        "Rate limit exceeded",
        ErrorCategory.RATE_LIMIT,
        ErrorSeverity.MEDIUM,
        { statusCode: 429, retryable: true, context, originalError: error }
      );
    }

    // Generic error
    return createError(
      error.message || "An unexpected error occurred",
      ErrorCategory.INTERNAL,
      ErrorSeverity.MEDIUM,
      { context, originalError: error }
    );
  }

  // Unknown error type
  return createError(
    "An unexpected error occurred",
    ErrorCategory.INTERNAL,
    ErrorSeverity.MEDIUM,
    { context }
  );
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    retryable?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryable = (error: Error) => {
      const parsed = parseError(error);
      return parsed.retryable;
    },
  } = options;

  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if error is not retryable or if it's the last attempt
      if (attempt === maxRetries || !retryable(lastError)) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increase delay for next retry (exponential backoff)
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError || new Error("Retry failed");
}

/**
 * Error recovery strategies
 */
export class ErrorRecovery {
  /**
   * Attempt to recover from database errors
   */
  static async recoverDatabaseError(error: ApiError): Promise<boolean> {
    if (error.category !== ErrorCategory.DATABASE) return false;

    // Could implement connection pool refresh, query optimization, etc.
    // For now, just log and return false
    console.warn("Database error recovery attempted:", error.message);
    return false;
  }

  /**
   * Attempt to recover from network errors
   */
  static async recoverNetworkError(error: ApiError): Promise<boolean> {
    if (error.category !== ErrorCategory.NETWORK) return false;

    // Could implement alternative endpoints, circuit breakers, etc.
    console.warn("Network error recovery attempted:", error.message);
    return false;
  }

  /**
   * Attempt to recover from external API errors
   */
  static async recoverExternalApiError(error: ApiError): Promise<boolean> {
    if (error.category !== ErrorCategory.EXTERNAL_API) return false;

    // Could implement fallback APIs, cached responses, etc.
    console.warn("External API error recovery attempted:", error.message);
    return false;
  }

  /**
   * Attempt recovery based on error category
   */
  static async attemptRecovery(error: ApiError): Promise<boolean> {
    switch (error.category) {
      case ErrorCategory.DATABASE:
        return this.recoverDatabaseError(error);
      case ErrorCategory.NETWORK:
        return this.recoverNetworkError(error);
      case ErrorCategory.EXTERNAL_API:
        return this.recoverExternalApiError(error);
      default:
        return false;
    }
  }
}

/**
 * Log error to Sentry with enhanced context
 * Safely handles cases where Sentry is not initialized or unavailable
 */
export function logErrorToSentry(error: ApiError) {
  try {
    // Check if Sentry is available and properly initialized
    if (typeof Sentry === "undefined" || typeof Sentry.captureException !== "function") {
      // Sentry not available - just log to console in production
      if (process.env.NODE_ENV === "production") {
        console.error("Error (Sentry not available):", {
          message: error.message,
          category: error.category,
          severity: error.severity,
          statusCode: error.statusCode,
          code: error.code,
          context: error.context,
        });
      }
      return;
    }

    const severityMap: Record<ErrorSeverity, Sentry.SeverityLevel> = {
      [ErrorSeverity.LOW]: "info",
      [ErrorSeverity.MEDIUM]: "warning",
      [ErrorSeverity.HIGH]: "error",
      [ErrorSeverity.CRITICAL]: "fatal",
    };

    Sentry.withScope((scope) => {
      scope.setTag("error_category", error.category);
      scope.setTag("error_code", error.code || "unknown");
      scope.setTag("retryable", error.retryable.toString());
      scope.setLevel(severityMap[error.severity]);

      if (error.context) {
        scope.setContext("error_context", error.context as Record<string, any>);
        if (error.context.userId) {
          scope.setUser({ id: error.context.userId });
        }
      }

      if (error.originalError) {
        Sentry.captureException(error.originalError);
      } else {
        Sentry.captureException(error);
      }
    });
  } catch (sentryError) {
    // Sentry logging failed - don't break the app
    console.error("Failed to log to Sentry:", sentryError);
    console.error("Original error:", error);
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: ApiError): string {
  const messages: Record<ErrorCategory, string> = {
    [ErrorCategory.AUTHENTICATION]: "Please log in to continue",
    [ErrorCategory.AUTHORIZATION]: "You don't have permission to perform this action",
    [ErrorCategory.VALIDATION]: "Please check your input and try again",
    [ErrorCategory.NOT_FOUND]: "The requested resource was not found",
    [ErrorCategory.RATE_LIMIT]: "Too many requests. Please try again later",
    [ErrorCategory.NETWORK]: "Network error. Please check your connection and try again",
    [ErrorCategory.DATABASE]: "A database error occurred. Please try again",
    [ErrorCategory.EXTERNAL_API]: "Service temporarily unavailable. Please try again later",
    [ErrorCategory.PAYMENT]: "Payment processing failed. Please try again",
    [ErrorCategory.INTERNAL]: "An unexpected error occurred. Please try again later",
    [ErrorCategory.TIMEOUT]: "Request timed out. Please try again",
  };

  return messages[error.category] || error.message;
}

