/**
 * Centralized error handling utilities
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export class AppError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 500, "INTERNAL_ERROR", { originalError: error });
  }

  return new AppError("An unexpected error occurred", 500, "UNKNOWN_ERROR");
}

/**
 * User-friendly error messages
 */
export const errorMessages = {
  UNAUTHORIZED: "You need to be logged in to access this.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Something went wrong on our end. Please try again later.",
  RATE_LIMIT: "Too many requests. Please wait a moment.",
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError | Error | unknown): string {
  if (error instanceof AppError) {
    if (error.code && errorMessages[error.code as keyof typeof errorMessages]) {
      return errorMessages[error.code as keyof typeof errorMessages];
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return errorMessages.SERVER_ERROR;
}

