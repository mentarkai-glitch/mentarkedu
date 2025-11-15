import type { ApiResponse, PaginatedResponse } from "@/lib/types";
import { NextResponse } from "next/server";
import {
  ApiError,
  parseError,
  logErrorToSentry,
  getUserFriendlyMessage,
  ErrorCategory,
  ErrorSeverity,
  type ErrorContext,
} from "./enhanced-error-handler";

/**
 * Create standardized success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Create standardized error response
 */
export function errorResponse(
  error: string | ApiError,
  status?: number,
  context?: ErrorContext
): NextResponse<ApiResponse> {
  let apiError: ApiError;

  if (error instanceof ApiError) {
    apiError = error;
    if (context) {
      apiError.context = { ...apiError.context, ...context };
    }
  } else {
    apiError = parseError(new Error(error), context);
    if (status) {
      apiError.statusCode = status;
    }
  }

  // Log to Sentry for medium and above severity
  if (
    apiError.severity === ErrorSeverity.MEDIUM ||
    apiError.severity === ErrorSeverity.HIGH ||
    apiError.severity === ErrorSeverity.CRITICAL
  ) {
    logErrorToSentry(apiError);
  }

  return NextResponse.json(
    {
      success: false,
      error: getUserFriendlyMessage(apiError),
      ...(apiError.code && { code: apiError.code }),
      ...(apiError.retryable && { retryable: apiError.retryable }),
      ...(process.env.NODE_ENV === "development" && {
        details: apiError.message,
        category: apiError.category,
      }),
    },
    { status: apiError.statusCode }
  );
}

/**
 * Create paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      has_more: page * limit < total,
    },
  });
}

/**
 * Handle API errors consistently with enhanced error handling
 */
export function handleApiError(
  error: unknown,
  context?: ErrorContext
): NextResponse<ApiResponse> {
  console.error("API Error:", error);

  const apiError = parseError(error, context);
  return errorResponse(apiError, undefined, context);
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields<T extends Record<string, any>>(
  body: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missing?: string[] } {
  const missing: string[] = [];

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      missing.push(field as string);
    }
  }

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  return { valid: true };
}

/**
 * Parse and validate pagination parameters
 */
export function parsePaginationParams(
  searchParams: URLSearchParams
): { page: number; limit: number } {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  return { page, limit };
}

/**
 * Extract user ID from request (assumes auth middleware has run)
 */
export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  try {
    // In a real implementation, this would extract from JWT or session
    // For now, we'll assume it's passed in headers or extracted from Supabase auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return null;

    // Extract user ID from Bearer token or session
    // This is a placeholder - actual implementation depends on your auth setup
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Rate limiting helper (basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // New window
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (record.count >= maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  rateLimitMap.set(identifier, record);

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = ""): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${prefix}${prefix ? "_" : ""}${timestamp}${randomStr}`;
}

