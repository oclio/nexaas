# Environment Variables

nexaas uses [`@t3-oss/env-nextjs`](https://github.com/t3-oss/t3-env) with [zod](https://zod.dev) for typed, validated environment variables.

## How it works

Environment variables are defined in `src/core/env/index.ts` and validated at startup. Invalid or missing required variables throw a clear error before the app boots.

```ts
import { createEnv } from '@t3-oss/env-nextjs';
import z from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    // add server-only vars here
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    // add client-accessible vars here
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
```

## Server vs Client

| Scope    | Prefix         | Accessible where  |
| -------- | -------------- | ----------------- |
| `server` | none           | Server only       |
| `client` | `NEXT_PUBLIC_` | Server and client |

::: warning
Never put secrets in `client` variables. They are exposed to the browser.
:::

## Adding a new variable

1. Add it to `.env` and `.env.example`
2. Add a zod schema in the appropriate section (`server` or `client`)
3. If client-side, add it to `experimental__runtimeEnv`
4. Import `env` where needed: `import { env } from '@/core/env'`

## skipValidation

Validation is skipped in these cases:

- `SKIP_ENV_VALIDATION` env var is set
- Running on Vercel (`VERCEL` env var)
- During build (`npm_lifecycle_event === 'build'`)
- In test mode (`NODE_ENV === 'test'`)

This prevents CI and test runners from failing on missing env vars.

## Reference

See [`.env.example`](https://github.com/oclio/nexaas/blob/main/.env.example) for the full list of variables and their descriptions.
