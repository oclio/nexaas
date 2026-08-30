const knipConfig = {
  $schema: 'https://unpkg.com/knip@6/schema.json',
  ignore: [
    'commitlint.config.mjs',
    'messages/**',
    'src/core/i18n/**',
    'src/ui/components/shadcn/button.tsx',
    'src/ui/components/shadcn/dropdown-menu.tsx',
  ],
  ignoreBinaries: ['gitleaks'],
  ignoreDependencies: [
    '@axe-core/cli',
    '@commitlint/config-conventional',
    'gitleaks',
  ],
  tags: ['-lintignore'],
};

export default knipConfig;
