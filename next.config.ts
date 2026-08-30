import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { securityHeaders } from '@/core/security/headers';

const nextConfig: NextConfig = {
  reactCompiler: true,
  headers: () => [{ source: '/:path*', headers: securityHeaders }],
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});
const withNextIntl = createNextIntlPlugin('./src/core/i18n/request.ts');
const composedConfig = withBundleAnalyzer(withNextIntl(nextConfig));

const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

export default dsn
  ? withSentryConfig(composedConfig, {
      org: 'oclio',
      project: 'nexaas',
      ...(commitSha && {
        release: { name: commitSha, create: true, finalize: true },
      }),
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
