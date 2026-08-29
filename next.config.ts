import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /*
  config options here
  */
  reactCompiler: true,
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const composedConfig = withBundleAnalyzer(nextConfig);
const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export default dsn
  ? withSentryConfig(composedConfig, {
      org: 'oclio',
      project: 'nexaas',
      ...(commitSha && { release: { name: commitSha } }),
      silent: !process.env.CI,
      widenClientFileUpload: !!process.env.CI,
      tunnelRoute: '/monitoring',
      webpack: {
        automaticVercelMonitors: true,
        treeshake: {
          removeDebugLogging: true,
        },
      },
    })
  : composedConfig;
