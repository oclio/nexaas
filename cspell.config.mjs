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
  words: ['nexaas', 'oclio', 'sonarqube', 'turbopack'],
};

export default config;
