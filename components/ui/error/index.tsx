/**
 * Unified Error Handling Components
 * 
 * Provides consistent error states and handling:
 * - ErrorBoundary - React error boundary
 * - ErrorToast - Toast notifications for errors
 * - ErrorFallback - Fallback UI for errors
 * - ErrorMessage - Inline error messages
 */

'use client';

import * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// ============================================================================
// Error Boundary Component
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Send to error tracking (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } },
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// Error Fallback Component
// ============================================================================

export interface ErrorFallbackProps {
  error: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
}

export function ErrorFallback({
  error,
  resetError,
  title = 'Something went wrong',
  message,
}: ErrorFallbackProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/dashboard/student');
    resetError?.();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="max-w-md w-full space-y-6">
        <Alert className="bg-red-500/10 border-red-500/50">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <AlertTitle className="text-red-400 font-semibold">{title}</AlertTitle>
          <AlertDescription className="text-slate-300 mt-2">
            {message || error.message || 'An unexpected error occurred. Please try again.'}
          </AlertDescription>
          
          {process.env.NODE_ENV === 'development' && error.stack && (
            <details className="mt-4">
              <summary className="text-xs text-slate-400 cursor-pointer">
                Error details (dev only)
              </summary>
              <pre className="mt-2 text-xs text-slate-500 overflow-auto max-h-48 p-2 bg-slate-900 rounded">
                {error.stack}
              </pre>
            </details>
          )}
        </Alert>

        <div className="flex gap-3">
          {resetError && (
            <Button
              onClick={resetError}
              variant="outline"
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button
            onClick={handleGoHome}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Error Message Component (Inline)
// ============================================================================

export interface ErrorMessageProps {
  error: string | Error | null;
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
  showIcon?: boolean;
}

export function ErrorMessage({
  error,
  className,
  variant = 'default',
  showIcon = true,
}: ErrorMessageProps) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  if (variant === 'inline') {
    return (
      <p className={cn('text-sm text-red-400 mt-1', className)}>
        {showIcon && <AlertTriangle className="w-3 h-3 inline mr-1" />}
        {errorMessage}
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-red-400', className)}>
        {showIcon && <AlertTriangle className="w-4 h-4" />}
        <span>{errorMessage}</span>
      </div>
    );
  }

  return (
    <Alert className={cn('bg-red-500/10 border-red-500/50', className)}>
      {showIcon && <AlertTriangle className="h-4 w-4 text-red-400" />}
      <AlertDescription className="text-red-300">{errorMessage}</AlertDescription>
    </Alert>
  );
}

// ============================================================================
// Error Toast Helper
// ============================================================================

export function showErrorToast(error: string | Error, options?: {
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  const message = typeof error === 'string' ? error : error.message;
  const title = options?.title || 'Error';

  toast.error(title, {
    description: message,
    duration: options?.duration || 5000,
    action: options?.action,
  });
}

export function showSuccessToast(message: string, options?: {
  title?: string;
  duration?: number;
}) {
  toast.success(options?.title || 'Success', {
    description: message,
    duration: options?.duration || 3000,
  });
}

// Export all error components
export default {
  ErrorBoundary,
  ErrorFallback,
  ErrorMessage,
  showErrorToast,
  showSuccessToast,
};





