const knipConfig = {
  $schema: 'https://unpkg.com/knip@6/schema.json',
  ignore: [],
  ignoreBinaries: ['gitleaks'],
  ignoreDependencies: ['@axe-core/cli', 'cross-env', 'gitleaks'],
  tags: ['-lintignore'],
};

export default knipConfig;
