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
<a href="https://github.com/oclio/nexaas"><img src="https://img.shields.io/badge/mutation%20score-99.73%25-brightgreen" alt="Mutation score" /></a>
<a href="https://sonarcloud.io/summary/new_code?id=oclio_nexaas"><img src="https://sonarcloud.io/api/project_badges/measure?project=oclio_nexaas&metric=alert_status&token=f575e67da74f2486cb1fe0d4cd95f0ea136b6a22" alt="Quality gate status" /></a>
<a href="https://sonarcloud.io/summary/new_code?id=oclio_nexaas"><img src="https://sonarcloud.io/api/project_badges/measure?project=oclio_nexaas&metric=reliability_rating&token=f575e67da74f2486cb1fe0d4cd95f0ea136b6a22" alt="Reliability Rating" /></a>
<a href="https://sonarcloud.io/summary/new_code?id=oclio_nexaas"><img src="https://sonarcloud.io/api/project_badges/measure?project=oclio_nexaas&metric=software_quality_security_issues&token=f575e67da74f2486cb1fe0d4cd95f0ea136b6a22" alt="Security issues" /></a>
</div>

Stop debugging production. Start shipping with total confidence.

A Next.js SaaS architecture hardened by mutation testing and bulletproof TypeScript patterns. Every refactor is safe, every deploy is calm, and your 3am alerts stay silent.

📖 **[Full documentation](https://nexaas-docs.oclio.dev)** — architectures, features, and guides.

## Stack

| Technology                                     | Role                                  |
| ---------------------------------------------- | ------------------------------------- |
| [Next.js](https://nextjs.org) 16               | App Router, Turbopack, React Compiler |
| [React](https://react.dev) 19                  | UI library                            |
| [TypeScript](https://www.typescriptlang.org) 6 | Type safety                           |
| [Tailwind CSS](https://tailwindcss.com) 4      | Styling                               |
| [shadcn/ui](https://ui.shadcn.com)             | Component system (base-lyra style)    |

## Features

- **Observability** — [Axiom](https://axiom.co) logging + [Sentry](https://sentry.io) error tracking, composable middleware chain, automatic web vitals reporting
- **Security** — [Arcjet](https://arcjet.com) rate limiting & bot detection, CSP with nonce, CSRF protection, body size limit, secure cookies
- **i18n** — [next-intl](https://next-intl.dev) with locale-segmented routing, typed message bundles, persistent locale switcher
- **Email** — [Resend](https://resend.com) + [React Email](https://react.email) templates (OTP, welcome, reset, invitations), provider-agnostic mailer interface
- **Dark mode** — [`next-themes`](https://github.com/pacocoursey/next-themes), OKLCH color space, persists across reloads

## Requirements

| Tool    | Version                        |
| ------- | ------------------------------ |
| Node.js | >= 24.0.0                      |
| pnpm    | 11.20.0 (via `packageManager`) |

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
