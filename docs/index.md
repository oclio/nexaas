---
layout: home

hero:
  name: nexaas
  text: Ship SaaS. Skip the setup.
  tagline: The opinionated Next.js SaaS starter for senior devs. Strict tooling, mutation testing, and conventions that scale.
  image:
    src: /logo.svg
    alt: nexaas logo
  actions:
    - theme: brand
      text: Quick Start
      link: /getting-started/
    - theme: alt
      text: Roadmap
      link: /roadmap

features:
  - title: Strict Tooling
    details: ESLint 10 with full plugin suite, Prettier 3, Knip, Gitleaks, axe-core, markdownlint, cspell. Non-negotiable quality contract.
  - title: Mutation Testing
    details: Stryker 10 out of the box. No surviving mutants. Every branch must correspond to a real business rule or testable error case.
  - title: 100% Coverage
    details: Vitest 4 with v8 coverage. Every line of source code is tested. SonarQube integration for continuous quality monitoring.
  - title: E2E Ready
    details: Playwright 1.55 with chromium. Example e2e test included. CI pipeline installs browsers and uploads reports automatically.
  - title: Conventional Commits
    details: Commitizen, commitlint, and Changesets wired together. Automated version PRs and changelog generation on every merge to main.
  - title: CI/CD Built-in
    details: GitHub Actions workflows for check, build, e2e, SonarQube, CodeQL, and release. Dependabot with grouped dependency updates.
  - title: Typed Env Validation
    details: '@t3-oss/env-nextjs with zod schemas. Server and client variables validated at startup. No more undefined at runtime.'
  - title: Next.js 16
    details: Built on the latest Next.js with Turbopack. App Router, Server Components, and modern conventions from day one.
---
