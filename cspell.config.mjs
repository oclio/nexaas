import ignore from './ignore.mjs';

const config = {
  dictionaries: ['node', 'npm', 'softwareTerms', 'typescript'],
  ignorePaths: [
    ...ignore,
    '**/docs/**',
    'drizzle/**',
    'messages/fr/**',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'src/app/[locale]/**/__e2e__/**',
  ],
  language: 'en,fr',
  words: [
    'arcjet',
    'axiomhq',
    'credentialless',
    'emaillist',
    'français',
    'healthcheck',
    'httponly',
    'hugeicons',
    'isready',
    'msvalidate',
    'nexaas',
    'nojekyll',
    'nosniff',
    'oclio',
    'oklch',
    'pgvector',
    'sonarqube',
    'srcs',
    'ttfb',
    'turbopack',
    'unstub',
  ],
};

export default config;
