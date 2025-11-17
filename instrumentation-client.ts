import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysOnErrorSampleRate: 1.0, // If sampling entire session, change to 0.1 to avoid sampling all sessions
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions where error doesn't occur
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Don't send errors in development
  enabled: process.env.NODE_ENV === 'production',
  
  // Only send errors in production
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});

// Export router transition hook for navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
