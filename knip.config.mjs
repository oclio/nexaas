const knipConfig = {
  $schema: 'https://unpkg.com/knip@6/schema.json',
  ignore: [
    '.storybook/mocks/**',
    'commitlint.config.mjs',
    'docs/.vitepress/**',
    'src/core/i18n/**',
    'src/core/mailer/index.ts',
    'src/core/mailer/types.ts',
    'src/navigation.ts',
    'src/ui/components/shadcn/button.tsx',
    'src/ui/components/shadcn/dropdown-menu.tsx',
    'tests/unit/mocks/intl.tsx',
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
