# nexaas

A scalable, production-ready SaaS boilerplate built for high performance and rapid prototyping in Next.js.

## Requirements

| Tool    | Version                        |
| ------- | ------------------------------ |
| Node.js | >= 24.0.0                      |
| pnpm    | 11.20.0 (via `packageManager`) |

## Stack

| Technology                                     | Role                                  |
| ---------------------------------------------- | ------------------------------------- |
| [Next.js](https://nextjs.org) 16               | App Router, Turbopack, React Compiler |
| [React](https://react.dev) 19                  | UI library                            |
| [TypeScript](https://www.typescriptlang.org) 6 | Type safety                           |
| [Tailwind CSS](https://tailwindcss.com) 4      | Styling                               |

## Tooling

| Tool                                                              | Purpose                                 |
| ----------------------------------------------------------------- | --------------------------------------- |
| [ESLint](https://eslint.org) 10                                   | Linting (flat config)                   |
| [Prettier](https://prettier.io) 3                                 | Code formatting                         |
| [typescript-eslint](https://typescript-eslint.io) 8               | TypeScript-specific lint rules          |
| [Knip](https://knip.dev) 6                                        | Dead code & unused dependency detection |
| [Gitleaks](https://github.com/gitleaks/gitleaks)                  | Secret scanning                         |
| [axe-core](https://github.com/dequelabs/axe-core)                 | Accessibility auditing                  |
| [markdownlint](https://github.com/igorshubovych/markdownlint-cli) | Markdown linting                        |
| [cspell](https://cspell.org)                                      | Spell checking                          |
| [Vitest](https://vitest.dev) 4                                    | Unit testing & coverage v8              |
| [@testing-library/react](https://testing-library.com/docs/react)  | React component testing utilities       |

## Scripts

| Script                   | Description                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `scripts/check-a11y.mjs` | Runs axe-core against one or more routes. Requires `pnpm dev` running.             |
|                          | Usage: `pnpm check:a11y / /about` or `pnpm check:a11y http://localhost:3000/login` |
