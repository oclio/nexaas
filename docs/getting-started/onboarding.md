# Onboarding

You have the app running. Now make it yours. Follow these steps in order — each one is a few minutes of work.

## 1. Brand identity

Edit `src/config/brand.ts` — your app name and author. These values surface in the page title, metadata, JSON-LD, manifest, emails, and footer.

```ts
export const brand = {
  title: 'your-app',
  author: {
    name: 'your-name',
    email: 'hello@your-domain.com',
    url: 'https://your-domain.com',
    twitter: '@your-handle',
  },
};
```

## 2. Translated metadata

Edit `messages/{locale}/meta.ts` for each locale — the site description and SEO keywords. These feed the `<meta name="description">` and `<meta name="keywords">` tags, the OpenGraph description, and the JSON-LD structured data.

```ts
export default {
  description: 'Your product description here.',
  keywords: ['your', 'keywords', 'here'],
} as const;
```

## 3. Navigation

Edit `src/config/navigation.ts` — nav items, footer categories, and social links. Labels are i18n keys (not display text), so each label must exist in `messages/{locale}/`.

```ts
export const navigation: NavigationItem[] = [
  {
    label: 'pages.landing.features.title', // i18n key
    href: '/#features-section',
    location: ['navbar', 'footer', 'mobileMenu'],
    category: 'product',
  },
];
```

Then edit `messages/{locale}/pages-*.ts` to add or adjust the translated titles and descriptions referenced by your navigation items.

## 4. Visual assets

Replace these files with your own branding:

| File                         | Used by                                   |
| ---------------------------- | ----------------------------------------- |
| `public/images/logo.svg`     | navbar and footer logo                    |
| `public/images/logo-192.png` | PWA manifest icon (192×192)               |
| `public/images/logo-512.png` | PWA manifest icon (512×512)               |
| `public/images/og.png`       | OpenGraph social preview image (1200×630) |
| `src/app/icon.svg`           | Next.js favicon                           |
| `src/app/apple-icon.png`     | Apple touch icon                          |
| `emails/static/logo.png`     | email header logo                         |

Keep the same filenames and dimensions — no code changes needed.

## 5. Icons (optional)

The icon registry lives at `src/config/icons.tsx`. Every component — including shadcn primitives — routes through this single file. If you're happy with Hugeicons, skip this step.

Want Lucide instead? Change one file, run one command, done. No find-and-replace across 20 files. No broken imports.

```tsx
// src/config/icons.tsx — the only file to change
import { Check, ChevronRight, Menu, Moon, Sun, X } from 'lucide-react';

export const ICONS = {
  cancel: X,
  chevronRight: ChevronRight,
  menu: Menu,
  themeDark: Moon,
  themeLight: Sun,
  tick: Check,
  // ...
};

export function icon(
  name: keyof typeof ICONS,
  props?: Record<string, unknown>,
) {
  const Icon = ICONS[name];
  return <Icon {...props} />;
}
```

```bash
pnpm remove @hugeicons/react @hugeicons/core-free-icons
pnpm add lucide-react
```

Update `components.json` so new shadcn components are generated with the right icon library:

```json
{
  "iconLibrary": "lucide"
}
```

New shadcn components added via `pnpm dlx shadcn@latest add <component>` will import from `lucide-react` directly. Replace those imports with `icon()` from `@/config/icons` for consistency — or leave them as-is, both work.
