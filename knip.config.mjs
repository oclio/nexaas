const knipConfig = {
  $schema: 'https://unpkg.com/knip@6/schema.json',
  ignore: [
    '.storybook/mocks/**',
    'commitlint.config.mjs',
    'docs/.vitepress/**',
    'src/core/auth/client.ts',
    'src/core/i18n/**',
    'src/core/mailer/index.ts',
    'src/core/mailer/types.ts',
    'src/ui/components/shadcn/dropdown-menu.tsx',
    'src/ui/components/shadcn/field.tsx',
    'src/ui/components/shadcn/input-otp.tsx',
    'src/ui/components/shadcn/input.tsx',
    'src/ui/components/shadcn/label.tsx',
    'src/ui/components/shadcn/separator.tsx',
    'src/ui/components/shadcn/sheet.tsx',
    'src/ui/components/shadcn/sonner.tsx',
  ],
  ignoreBinaries: ['gitleaks'],
  ignoreDependencies: [
    '@axe-core/cli',
    '@commitlint/config-conventional',
    'gitleaks',
    'input-otp',
  ],
  tags: ['-lintignore'],
};

export default knipConfig;
