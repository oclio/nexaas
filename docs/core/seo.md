# SEO

saaskip ships with a complete SEO stack: metadata generation, sitemap, robots, OpenGraph/Twitter cards, JSON-LD structured data, and a PWA manifest — all built-in, no extra dependencies.

## Setup

The only required environment variable is `NEXT_PUBLIC_APP_URL`, already used by the rest of the stack. No additional configuration is needed.

## File structure

```text
src/core/seo/
  create-layout-metadata.ts   → root metadata (title, description, OG, Twitter, robots, viewport, appleWebApp, alternates)
  create-page-metadata.ts     → per-page metadata from x-locale and x-pathname headers
  create-viewport.ts          → viewport and theme-color metadata
  json-ld.tsx                 → WebSite and Organization JSON-LD generators + JsonLdScript component
  index.ts                    → public re-exports

src/app/
  sitemap.ts                  → sitemap.xml generation (routes × locales with hreflang)
  robots.ts                   → robots.txt generation
  manifest.ts                 → PWA manifest (icons, theme colors, display mode)
  icon.svg                    → modern SVG favicon
  apple-icon.png              → Apple touch icon (180×180)

public/images/
  og.png                      → OpenGraph and Twitter card image (1200×630)
  logo-192.png                → PWA icon (192×192)
  logo-512.png                → PWA icon (512×512)
```

## Metadata

### Layout metadata

`createLayoutMetadata` generates the root metadata applied to every page. It pulls translated fields from the `meta` namespace and static fields from `src/config.ts`.

```ts
// src/app/[locale]/layout.tsx
import { createLayoutMetadata } from '@/core/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return createLayoutMetadata({ locale });
}
```

Translated fields (title, description, keywords, OG/Twitter text) come from `messages/<locale>/meta.ts`. Static fields (metadataBase, robots, viewport, appleWebApp, verification) are hardcoded since they don't vary by locale.

### Page metadata

`createPageMetadata` builds per-page metadata by reading the `x-locale` header (set by the `withIntl` middleware) and the `x-pathname` header (set by the proxy entrypoint). The locale prefix is stripped from the pathname to derive the page path. Translated fields (title, description) are extracted from the page's i18n namespace. This allows each page to set its own canonical and hreflang alternates without repeating the locale logic.

```ts
// src/app/[locale]/(main)/(landing)/page.tsx
import { createPageMetadata } from '@/core/seo';

export async function generateMetadata() {
  return createPageMetadata();
}
```

### Viewport

`createViewport` returns the viewport and theme-color metadata. It is wired into the layout via the `viewport` export:

```ts
// src/app/[locale]/layout.tsx
import { createViewport } from '@/core/seo';

export const viewport = createViewport();
```

## Sitemap and robots

### Sitemap

`src/app/sitemap.ts` generates a sitemap entry per route per locale. Routes are declared inline:

```ts
const routes = [{ path: '', changeFrequency: 'weekly' as const, priority: 1 }];
```

Each entry includes:

- `url` — `${NEXT_PUBLIC_APP_URL}/${locale}${path}`
- `lastModified` — current date
- `changeFrequency` and `priority` — from the route definition
- `alternates.languages` — hreflang mapping to all supported locales

### Adding a route to the sitemap

1. Add an entry to the `routes` array in `src/app/sitemap.ts`
2. The route appears for every locale automatically

### Robots

`src/app/robots.ts` allows all user agents, disallows `/api/` and `/admin/`, and points to the sitemap at `${NEXT_PUBLIC_APP_URL}/sitemap.xml`.

## OpenGraph and Twitter

The OpenGraph and Twitter card images reference `/images/og.png` (1200×630). This static image is suitable for both `og:image` and Twitter's `summary_large_image` card.

To replace it, overwrite `public/images/og.png` with your own 1200×630 PNG.

## JSON-LD structured data

Two JSON-LD generators are available in `src/core/seo/json-ld.tsx`:

- `websiteJsonLd()` — `WebSite` schema with name, url, description, and publisher
- `organizationJsonLd()` — `Organization` schema with name, url, logo (PNG), email, and `sameAs` (author URL + Twitter)

The `JsonLdScript` component renders a `<script type="application/ld+json">` tag. Both schemas are injected in the root layout:

```tsx
<JsonLdScript data={websiteJsonLd()} />
<JsonLdScript data={organizationJsonLd()} />
```

### Customizing

Edit `src/config.ts` to change the organization name, author URL, email, and Twitter handle. The JSON-LD generators pick up these values automatically.

## PWA manifest

`src/app/manifest.ts` generates a web manifest with:

- `name` and `short_name` from `app.title`
- `description` from the English `meta` namespace
- `start_url: '/'`, `display: 'standalone'`
- `theme_color` and `background_color`: `#0a0a0a`
- Icons: `logo-192.png` and `logo-512.png`

Next.js serves it at `/manifest.webmanifest` automatically.

## Internationalization and SEO

- `<html lang={locale}>` — set dynamically in the root layout
- `alternates.canonical` — `/${locale}` at layout level, `/${locale}${path}` at page level (path derived from `x-pathname` with locale prefix stripped)
- `alternates.languages` — hreflang mapping to all supported locales, with `x-default` pointing to the default locale
- `openGraph.locale` — mapped to `fr_FR` or `en_US`
- Sitemap includes hreflang `alternates.languages` per entry

## Deployment checklist

- [ ] Set `NEXT_PUBLIC_APP_URL` to your production URL
- [ ] Replace `public/images/og.png` with your own OG image
- [ ] Replace `src/app/icon.svg` and `apple-icon.png` with your branding
- [ ] Replace `public/images/logo-192.png` and `logo-512.png` with your icons
- [ ] Edit `src/config.ts` with your app title, author, and social links
- [ ] Add Google Search Console verification code in `createLayoutMetadata` (`verification.google`)
- [ ] Submit `https://your-domain.com/sitemap.xml` to Google Search Console
- [ ] Verify that all locales are indexed separately in GSC
