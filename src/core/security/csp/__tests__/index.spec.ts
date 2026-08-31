import { buildCSP } from '../index';

describe('buildCSP', () => {
  it('includes nonce and strict-dynamic when nonce is provided', () => {
    const csp = buildCSP('abc123', false);

    expect(csp).toBe(
      "default-src 'self'; script-src 'self' 'nonce-abc123' 'strict-dynamic' https://vercel.live https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'self' https://vercel.live; worker-src 'self' blob:; connect-src 'self' https://*.sentry.io https://*.arcjet.com https://api.axiom.co https://va.vercel-scripts.com; upgrade-insecure-requests",
    );
  });

  it('falls back to unsafe-inline when nonce is null', () => {
    const csp = buildCSP(null, false);

    expect(csp).toContain("'unsafe-inline'");
    expect(csp).not.toContain("'nonce-null'");
    expect(csp).not.toContain("'strict-dynamic'");
  });

  it('falls back to unsafe-inline when nonce is undefined', () => {
    const csp = buildCSP(undefined, false);

    expect(csp).toContain("'unsafe-inline'");
    expect(csp).not.toContain("'nonce-undefined'");
  });

  it('includes unsafe-eval in development', () => {
    const csp = buildCSP(undefined, true);

    expect(csp).toContain("'unsafe-eval'");
  });

  it('excludes unsafe-eval in production', () => {
    const csp = buildCSP(undefined, false);

    expect(csp).not.toContain("'unsafe-eval'");
  });

  it('includes upgrade-insecure-requests in production', () => {
    const csp = buildCSP(undefined, false);

    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('excludes upgrade-insecure-requests in development', () => {
    const csp = buildCSP(undefined, true);

    expect(csp).not.toContain('upgrade-insecure-requests');
  });

  it('includes ws and wss in connect-src for development', () => {
    const csp = buildCSP(undefined, true);

    expect(csp).toContain(' ws: wss:');
  });

  it('excludes ws and wss in connect-src for production', () => {
    const csp = buildCSP(undefined, false);

    expect(csp).not.toContain('ws:');
    expect(csp).not.toContain('wss:');
  });

  it('includes report-uri and report-to when reportUri is provided', () => {
    const csp = buildCSP(undefined, false, 'https://example.com/report');

    expect(csp).toBe(
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'self' https://vercel.live; worker-src 'self' blob:; connect-src 'self' https://*.sentry.io https://*.arcjet.com https://api.axiom.co https://va.vercel-scripts.com; upgrade-insecure-requests; report-uri https://example.com/report; report-to csp-endpoint",
    );
  });

  it('excludes report-uri and report-to when reportUri is not provided', () => {
    const csp = buildCSP(undefined, false);

    expect(csp).not.toContain('report-uri');
    expect(csp).not.toContain('report-to');
  });

  it('produces exact CSP for development without reportUri', () => {
    const csp = buildCSP(undefined, true);

    expect(csp).toBe(
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'self' https://vercel.live; worker-src 'self' blob:; connect-src 'self' https://*.sentry.io https://*.arcjet.com https://api.axiom.co https://va.vercel-scripts.com ws: wss:",
    );
  });

  it('always includes core directives', () => {
    const csp = buildCSP(undefined, false);

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' blob: data: https:");
    expect(csp).toContain("font-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("frame-src 'self' https://vercel.live");
    expect(csp).toContain("worker-src 'self' blob:");
  });

  it('always includes connect-src with sentry, arcjet, axiom, and vercel', () => {
    const csp = buildCSP(undefined, false);

    expect(csp).toContain('https://*.sentry.io');
    expect(csp).toContain('https://*.arcjet.com');
    expect(csp).toContain('https://api.axiom.co');
    expect(csp).toContain('https://va.vercel-scripts.com');
  });

  it('always includes vercel.live in script-src and frame-src', () => {
    const csp = buildCSP(undefined, false);

    expect(csp).toContain('https://vercel.live');
  });

  it('joins directives with semicolons', () => {
    const csp = buildCSP(undefined, false);

    expect(csp).toMatch(/; /);
    expect(csp.startsWith(';')).toBe(false);
    expect(csp.endsWith(';')).toBe(false);
  });
});
