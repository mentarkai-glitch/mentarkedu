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
        'firebase-admin/app': 'commonjs firebase-admin/app',
        'firebase-admin/messaging': 'commonjs firebase-admin/messaging',
      });
    }
    
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

// Sentry Webpack Plugin Options
const sentryWebpackPluginOptions = {
  // Only upload source maps in production
  silent: process.env.NODE_ENV === "development",
  org: "mentark-tech",
  
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
