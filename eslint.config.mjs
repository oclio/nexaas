import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import promise from 'eslint-plugin-promise';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarJs from 'eslint-plugin-sonarjs';
import tsdoc from 'eslint-plugin-tsdoc';
import unicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

import ignore from './ignore.mjs';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  sonarJs.configs.recommended,
  promise.configs['flat/recommended'],
  unicorn.configs['recommended'],
  prettier,
  globalIgnores([...ignore, 'docs']),
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,mts,cjs,cts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      tsdoc,
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'tsdoc/syntax': 'warn',
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
        },
      ],
      'unicorn/name-replacements': [
        'error',
        {
          checkFilenames: false,
          replacements: {
            e2e: false,
          },
          allowList: {
            Dev: true,
            Props: true,
            db: true,
            dev: true,
            e2e: true,
            env: true,
            err: true,
            generateStaticParams: true,
            props: true,
            res: true,
            req: true,
          },
        },
      ],
      '@typescript-eslint/no-extraneous-class': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'sonarjs/todo-tag': 'off',
      'sonarjs/tsdoc-unsupported-tag': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prefer-string-raw': 'off',
    },
  },
  // TESTS — allow non-kebab filenames (e.g. page.spec.tsx, page.e2e-spec.ts)
  {
    files: ['**/__e2e__/**/*.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
  // KEYS AUTO-SORT
  {
    files: [
      'cspell.config.mjs',
      'ignore.mjs',
      'knip.config.mjs',
      'test-exclude.mjs',
    ],
    plugins: { perfectionist },
    rules: {
      'perfectionist/sort-objects': [
        'error',
        { type: 'natural', order: 'asc', ignoreCase: true },
      ],
      'perfectionist/sort-arrays': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          ignoreCase: true,
          useConfigurationIf: { matchesAstSelector: '*' },
        },
      ],
    },
  },
]);

export default eslintConfig;
