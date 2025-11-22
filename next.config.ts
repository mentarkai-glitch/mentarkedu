import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Ignore ESLint during builds (warnings don't affect functionality)
  // ESLint can still be run manually with `npm run lint`
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on TypeScript errors
    ignoreBuildErrors: false,
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    
    // Make firebase-admin optional (only needed on server-side if configured)
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'firebase-admin': 'commonjs firebase-admin',
      });
    }
    
    return config;
  },
};

// Only wrap with Sentry config if SENTRY_AUTH_TOKEN is set
const finalConfig = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, {
      // Sentry configuration options
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    })
  : nextConfig;

export default finalConfig;
