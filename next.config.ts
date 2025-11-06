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
