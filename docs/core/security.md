# Security

nexaas implements a defense-in-depth strategy through composable middleware. Each security layer runs in the proxy chain and can be independently enabled or disabled via environment variables.

## Middleware Chain

All security middleware is registered in `src/proxy.ts` and runs in order:

```text
Request → withAxiom → withCsp → withCsrf → withBodySizeLimit → withArcjet → withSecureCookies → Response
```

| Order | Middleware          | Purpose                                        |
| ----- | ------------------- | ---------------------------------------------- |
| 1     | `withAxiom`         | Request tracing, logging                       |
| 2     | `withCsp`           | Content-Security-Policy header                 |
| 3     | `withCsrf`          | CSRF protection via Origin check               |
| 4     | `withBodySizeLimit` | Rejects oversized request bodies (413)         |
| 5     | `withArcjet`        | Rate limiting, bot detection, shield           |
| 6     | `withSecureCookies` | Enforces HttpOnly, Secure, SameSite on cookies |

Each middleware calls `next()` to pass control to the next layer. If a middleware rejects the request (e.g. CSRF fail, body too large, Arcjet deny), it returns a response directly without calling `next()`.

## Arcjet

[Arcjet](https://arcjet.com) provides rate limiting, bot protection, and shield (SQL injection, XSS detection).

### Configuration

| Variable     | Required | Description                                                                                          |
| ------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `ARCJET_KEY` | Optional | Arcjet API key. If unset, Arcjet is **bypassed** — the middleware passes through with no protection. |
| `ARCJET_ENV` | Optional | `development` (default), `production`, or `staging`. Controls `LIVE` vs `DRY_RUN` mode.              |

### Rules

- **Shield** — Detects common web attacks (SQL injection, XSS). `DRY_RUN` in development, `LIVE` in production.
- **Detect Bot** — Blocks automated clients. Allows Google/Bing crawlers and curl. `DRY_RUN` in development, `LIVE` in production.
- **Token Bucket** — Rate limit per IP: 300 tokens/hour, capacity of 100. `DRY_RUN` in development, `LIVE` in production.

### Fail-open strategy

If the Arcjet API is unavailable (`protect()` throws), the middleware logs the error to Axiom and Sentry but **allows the request through**. This prevents Arcjet outages from blocking legitimate traffic.

### Audit logging

When a request is denied, the middleware logs to both Axiom and Sentry:

- **Axiom** — `logger.warn('Request denied by Arcjet', { event, reason, ip, method, path, statusCode })`
- **Sentry** — `captureMessage('Request denied by Arcjet', { level: 'warning', tags: { reason } })`

The `reason` field is one of: `bot`, `rate_limit`, or `other`.

### Bypass when unconfigured

If `ARCJET_KEY` is not set, the Arcjet client is not initialized and `withArcjet` calls `next()` immediately. No protection is applied. This is useful for local development or CI.

## Content Security Policy (CSP)

The `withCsp` middleware sets the `Content-Security-Policy` header on every response.

### Features

- **Nonce-based script protection** — Dynamic routes (e.g. `/dashboard`) receive a per-request nonce. Scripts without the nonce are blocked. Uses `'strict-dynamic'` for compatibility.
- **Fallback to `'unsafe-inline'`** — Static routes use `'unsafe-inline'` for `script-src` since no nonce is generated.
- **Development vs production** — In development, `'unsafe-eval'` and WebSocket (`ws:`, `wss:`) sources are allowed. In production, `upgrade-insecure-requests` is enforced.
- **Sentry CSP reporting** — If `NEXT_PUBLIC_SENTRY_DSN` is configured, the middleware extracts the project ID and public key to build a Sentry CSP report URL. The `Reporting-Endpoints` header is set accordingly.

### Connected services

The CSP allows connections to:

- `https://*.sentry.io` — Error tracking
- `https://*.arcjet.com` — Security rules
- `https://api.axiom.co` — Logging
- `https://va.vercel-scripts.com` — Vercel Analytics
- `https://vercel.live` — Vercel live preview

## CSRF Protection

The `withCsrf` middleware protects against Cross-Site Request Forgery using the [OWASP 2023+ Origin header strategy](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#verifying-origin-with-standard-headers).

### How it works

1. **Safe methods bypass** — `GET`, `HEAD`, `OPTIONS` pass through without checking.
2. **Origin check** — For `POST`, `PUT`, `PATCH`, `DELETE`, the `Origin` header must match `NEXT_PUBLIC_APP_URL`.
3. **No Origin = allowed** — Requests without an `Origin` header (curl, server-to-server, API clients) are allowed through. These are not subject to CSRF by definition.
4. **Mismatch = 403** — If `Origin` is present but doesn't match, the request is rejected with `403 CSRF check failed`.

This approach requires no tokens, no server-side state, and works with all modern browsers. The `Origin` header is set by the browser and cannot be overridden by JavaScript.

## Request Body Size Limit

The `withBodySizeLimit` middleware rejects request bodies larger than 1MB to prevent memory exhaustion DoS attacks.

- Applies to `POST`, `PUT`, and `PATCH` methods.
- Checks the `Content-Length` header before the body is parsed.
- Returns `413 Payload Too Large` if the limit is exceeded.
- Requests without `Content-Length` (e.g. chunked transfer encoding) are allowed through — the runtime handles those.
- Invalid `Content-Length` values (non-numeric) are also rejected with `413`.

## Secure Cookies

The `withSecureCookies` middleware enforces secure attributes on all cookies in the response.

### Enforced attributes

| Attribute         | When            | Purpose                                                                       |
| ----------------- | --------------- | ----------------------------------------------------------------------------- |
| `HttpOnly`        | Always          | Prevents JavaScript access via `document.cookie` (mitigates XSS cookie theft) |
| `SameSite=Strict` | Always          | Prevents cookies from being sent on cross-site requests (complements CSRF)    |
| `Path=/`          | Always          | Ensures cookie is available across the entire site                            |
| `Secure`          | Production only | Ensures cookies are only sent over HTTPS                                      |

In development, `Secure` is omitted to allow HTTP testing on `localhost`.

Existing attributes are preserved — the middleware does not duplicate attributes already present on a cookie (e.g. `Max-Age`, `Expires`, custom `Path`).

## Email Whitelist

The `isAuthorizedEmail()` function in `src/core/security/email-whitelist.ts` restricts access to specific email addresses during development or testing.

### Configuration

Set `EMAIL_WHITELIST` in your `.env` with comma or semicolon-separated email addresses:

```bash
EMAIL_WHITELIST=tester1@example.com,tester2@example.com;tester3@example.com
```

### Behavior

- **Empty or unset** — All emails are authorized (fail-open). This is the default for production.
- **Set** — Only emails in the whitelist are authorized.
- **Validation** — Invalid email entries (e.g. `not-an-email`) are filtered out using `zod` email validation.
- **Normalization** — All emails are trimmed and lowercased before comparison. Casing differences don't cause false negatives.
- **Deduplication** — Duplicate entries are removed via `Set`.

### Usage

```ts
import { isAuthorizedEmail } from '@/core/security/email-whitelist';

if (!isAuthorizedEmail(userEmail)) {
  return new Response('Unauthorized', { status: 403 });
}
```

Typical use cases: restricting sign-ups during private beta, limiting newsletter subscriptions to test addresses, gating authentication in staging.
