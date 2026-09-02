---
'nexaas': minor
---

Fix secure cookie attributes bypass, add Logo component and response headers, refactor middleware architecture, and harden test suite

- Fix `withSecureCookies` bypass: move to outermost middleware position so
  `HttpOnly`, `SameSite`, and `Secure` attributes are applied to all response
  cookies (including `NEXT_LOCALE` set by next-intl)
- Restore middleware chain execution for non-API routes in `withIntl`
- Add `Logo` component with `next-image` optimization and i18n alt text
- Set `x-locale` response header for non-API routes
- Set `x-pathname` request/response header for full pathname tracking
- Extract middleware stack to dedicated `proxy-stack.ts` module
- Remove redundant `withSeo` middleware in favor of `x-pathname` header
- Drop redundant icons metadata in favor of Next.js file convention
- Harden all 50 test files: replace `toHaveBeenCalledOnce()` with
  `toHaveBeenCalled()`, eliminate unjustified dynamic imports, add consistent
  mock cleanup, replace weak `not.toBe('')` with `toBeTruthy()`, fix
  `mockHeaders` edge case, fix `sql` mock typing
- Improve e2e tests: use locator-based auto-retry assertions, parametrize
  x-pathname tests, add serial mode to theme-toggle, verify NEXT_LOCALE
  cookie is actually HttpOnly via `context.cookies()`
- Add e2e header checks for middleware response headers (x-locale, x-pathname,
  CSP, security headers, CSRF protection)
- Add unit tests for i18n/request, instrumentation, instrumentation-client,
  and Logo component
- Document withSecureCookies outermost position and onion model in security guide
- Update architecture and SEO guides for proxy-stack and header flow
- Enable Stryker mutation testing job in CI
