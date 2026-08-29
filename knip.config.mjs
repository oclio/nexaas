const knipConfig = {
  $schema: 'https://unpkg.com/knip@6/schema.json',
  ignore: [],
  ignoreBinaries: ['gitleaks'],
  ignoreDependencies: ['gitleaks'],
  tags: ['-lintignore'],
};

export default knipConfig;
