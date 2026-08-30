<div align="center">
  <img src="./docs/images/logo.svg" alt="Logo" width="45" />
  <h1>nexaas</h1>
  <p>
  Forget <i>production-ready</i>.
  <br />
  Build on something <strong>unbreakable</strong>.
  </p>

  <!-- Stryker badge: token unavailable, dashboard login broken — ticket opened with Stryker support -->

<a href="https://sonarcloud.io/summary/new_code?id=oclio_nexaas"><img src="https://sonarcloud.io/api/project_badges/measure?project=oclio_nexaas&metric=coverage&token=f575e67da74f2486cb1fe0d4cd95f0ea136b6a22" alt="Coverage" /></a>
<a href="https://github.com/oclio/nexaas"><img src="https://img.shields.io/badge/mutation%20score-100%25-brightgreen" alt="Mutation score" /></a>
<a href="https://sonarcloud.io/summary/new_code?id=oclio_nexaas"><img src="https://sonarcloud.io/api/project_badges/measure?project=oclio_nexaas&metric=alert_status&token=f575e67da74f2486cb1fe0d4cd95f0ea136b6a22" alt="Quality gate status" /></a>
<a href="https://sonarcloud.io/summary/new_code?id=oclio_nexaas"><img src="https://sonarcloud.io/api/project_badges/measure?project=oclio_nexaas&metric=reliability_rating&token=f575e67da74f2486cb1fe0d4cd95f0ea136b6a22" alt="Reliability Rating" /></a>
<a href="https://sonarcloud.io/summary/new_code?id=oclio_nexaas"><img src="https://sonarcloud.io/api/project_badges/measure?project=oclio_nexaas&metric=software_quality_security_issues&token=f575e67da74f2486cb1fe0d4cd95f0ea136b6a22" alt="Security issues" /></a>
</div>

Stop debugging production. Start shipping with total confidence.

A Next.js SaaS architecture hardened by mutation testing and bulletproof TypeScript patterns. Every refactor is safe, every deploy is calm, and your 3am alerts stay silent.

📖 **[Full documentation](https://nexaas-docs.oclio.dev)** — architectures, features, and guides.

## Requirements

| Tool    | Version                        |
| ------- | ------------------------------ |
| Node.js | >= 24.0.0                      |
| pnpm    | 11.20.0 (via `packageManager`) |

## Stack

| Technology                                                | Role                                  |
| --------------------------------------------------------- | ------------------------------------- |
| [Next.js](https://nextjs.org) 16                          | App Router, Turbopack, React Compiler |
| [React](https://react.dev) 19                             | UI library                            |
| [TypeScript](https://www.typescriptlang.org) 6            | Type safety                           |
| [Tailwind CSS](https://tailwindcss.com) 4                 | Styling                               |
| [shadcn/ui](https://ui.shadcn.com)                        | Component system (base-lyra style)    |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark mode & theme switching           |
| [Hugeicons](https://hugeicons.com)                        | Icon library                          |

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
| [Playwright](https://playwright.dev) 1.55                         | E2E testing (chromium)                  |
| [Stryker](https://stryker-mutator.io) 10                          | Mutation testing                        |
| [Husky](https://typicode.github.io/husky) 9                       | Git hooks                               |
| [lint-staged](https://github.com/lint-staged/lint-staged) 17      | Staged files linting                    |
| [commitlint](https://commitlint.js.org) 21                        | Conventional commits enforcement        |
| [Commitizen](https://commitizen-tools.github.io/commitizen) 4     | Interactive commit prompts              |
| [Changesets](https://github.com/changesets/changesets) 3          | Versioning & changelog management       |
| [@next/bundle-analyzer](https://github.com/vercel/next.js) 16     | Bundle analysis & visualization         |

## Features

### Dark mode

Theme switching is powered by [`next-themes`](https://github.com/pacocoursey/next-themes) and integrated at the root layout level via `ThemeProvider`. The `ThemeToggle` component on the landing page lets users switch between light and dark — the choice persists in `localStorage` and survives reloads.

CSS variables for both themes are defined in [`src/ui/styles/globals.css`](src/ui/styles/globals.css) using the OKLCH color space, with the `.dark` class applied to `<html>` as the activation strategy.

## Scripts

| Script                   | Description                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `scripts/check-a11y.mjs` | Runs axe-core against one or more routes. Requires `pnpm dev` running.             |
|                          | Usage: `pnpm check:a11y / /about` or `pnpm check:a11y http://localhost:3000/login` |

## Contributing

Contributions are welcome! See [`CONTRIBUTING.md`](.github/CONTRIBUTING.md) for guidelines and [`CODING_RULES.md`](.github/CODING_RULES.md) for coding conventions.

## Support the project

```text
As an: independent developer,
I want: to receive recurring funding,
So that: I can keep building tools you didn't know you needed.
```

<div align="center">
  <a href="https://github.com/sponsors/oclio"><img src="https://img.shields.io/badge/GitHub-Sponsors-purple?logo=github&logoColor=white" alt="GitHub Sponsors" /></a>
  <a href="https://buymeacoffee.com/oclio"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?logo=buymeacoffee&logoColor=black" alt="Buy Me a Coffee" /></a>
</div>

## License

[MIT](LICENSE)

<p align="center">
  <img src="docs/images/oclio_logo.svg" alt="oclio logo" width="48" />
</p>

<p align="center">
  <a href="https://oclio.dev">@oclio</a> — TypeScript Engineer<br>
  Lean, pragmatic, test-driven.
</p>
