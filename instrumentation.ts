import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime sentry not yet implemented
    // await import("./sentry.edge.config");
  }
  
  // Client-side Sentry config is automatically loaded from instrumentation-client.ts
  // Next.js will handle loading it for client-side code
}

// Export request error hook for server-side error handling
export const onRequestError = Sentry.captureRequestError;


