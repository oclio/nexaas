const knipConfig = {
  $schema: 'https://unpkg.com/knip@6/schema.json',
  ignore: ['commitlint.config.mjs', 'docs/**'],
  ignoreBinaries: ['gitleaks'],
  ignoreDependencies: [
    '@axe-core/cli',
    '@commitlint/config-conventional',
    'gitleaks',
  ],
  tags: ['-lintignore'],
};

export default knipConfig;
