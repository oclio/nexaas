---
'nexaas': minor
---

Added a defense-in-depth security middleware stack: Arcjet (rate limiting, bot protection, shield), CSP with nonce generation, CSRF protection via Origin header, request body size limit (1MB), secure cookie enforcement (HttpOnly, Secure, SameSite=Strict), and email whitelist for dev gating. Denied requests are logged to Axiom and Sentry. New env vars: `ARCJET_KEY`, `ARCJET_ENV`, `EMAIL_WHITELIST`.
