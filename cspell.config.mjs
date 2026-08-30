import ignore from './ignore.mjs';

const config = {
  dictionaries: ['node', 'npm', 'softwareTerms', 'typescript'],
  ignorePaths: [
    ...ignore,
    '**/docs/**',
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
    'français',
    'httponly',
    'hugeicons',
    'nexaas',
    'nojekyll',
    'nosniff',
    'oclio',
    'oklch',
    'sonarqube',
    'ttfb',
    'turbopack',
    'unstub',
  ],
};

export default config;
