# Quick Start

## Prerequisites

- Node.js 24+ (check `.nvmrc`)
- pnpm 11+ (`corepack enable`)

## Installation

```bash
git clone https://github.com/oclio/saaskip.git my-saas
cd my-saas
pnpm install
```

## Development

```bash
pnpm dev
```

The app runs on `http://localhost:3000`.

## Checks

```bash
pnpm check:all
```

This runs types, lint, knip, gitleaks, markdownlint, cspell, and build.

## Testing

```bash
pnpm test          # unit tests
pnpm test:e2e      # e2e tests
pnpm test:coverage # unit tests with coverage
pnpm test:mutate   # mutation testing
```
