import ignore from './ignore.mjs';

const config = {
  dictionaries: ['node', 'npm', 'softwareTerms', 'typescript'],
  ignorePaths: [
    ...ignore,
    '**/docs/**',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
  ],
  language: 'en,fr',
  words: [
    'arcjet',
    'axiomhq',
    'credentialless',
    'httponly',
    'nexaas',
    'nojekyll',
    'nosniff',
    'oclio',
    'sonarqube',
    'ttfb',
    'turbopack',
    'unstub',
  ],
};

export default config;
