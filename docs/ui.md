# UI

The `src/ui/` directory contains the presentation layer of saaskip. It is built on four pillars:

- **[Tailwind CSS](https://tailwindcss.com) 4** — utility-first styling with CSS variables for theming (OKLCH color space).
- **[shadcn/ui](https://ui.shadcn.com)** — component system using the **base-lyra** style. Unlike traditional libraries, components are copied into the project (`src/ui/components/shadcn/`) and fully owned by the codebase.
- **[Base UI](https://base-ui.com)** — unstyled headless primitives (accessibility, keyboard navigation, ARIA). The foundation layer that shadcn components build on.
- **Fonts** — [Inter](https://rsms.me/inter/) for body text (`--font-sans`) and [Montserrat](https://fonts.google.com/specimen/Montserrat) for headings (`--font-heading`), loaded via `next/font/google` in `src/ui/fonts/`.

## Structure

```text
src/ui/
  components/
    shadcn/         → shadcn/ui primitives (Button, DropdownMenu, …)
    dev/            → development-only tools (ScreenSize, …)
    theme-toggle.tsx
  helpers/          → cn() class merge utility
  hooks/            → reusable hooks (useIsMounted, …)
  icons/            → Hugeicons registry
  fonts/            → Next.js font definitions
  styles/           → globals.css (Tailwind + CSS variables)
```

## Component system

Components are built on [shadcn/ui](https://ui.shadcn.com) using the **base-lyra** style, with [Base UI](https://base-ui.com) as the headless primitive layer. Unlike traditional component libraries, shadcn components are copied into the project — they live in `src/ui/components/shadcn/` and are fully owned by the codebase.

### Available components

| Component | Path                            |
| --------- | ------------------------------- |
| Button    | `@/ui/components/shadcn/button` |

To add a new shadcn component:

```bash
pnpm dlx shadcn@latest add <component>
```

## Dark mode

Theme switching is powered by [next-themes](https://github.com/pacocoursey/next-themes) and integrated at the root layout via `ThemeProvider`.

### How it works

1. `ThemeProvider` wraps the app in `src/app/layout.tsx` with `attribute="class"` and `defaultTheme="system"`.
2. next-themes adds a `dark` class to `<html>` based on the user's preference (or system preference on first visit).
3. CSS variables for both themes are defined in `src/ui/styles/globals.css` using the OKLCH color space — the `.dark` selector overrides the `:root` values.
4. The choice persists in `localStorage` under the `theme` key and survives reloads.

### ThemeToggle

The `ThemeToggle` component (`src/ui/components/theme-toggle.tsx`) is a button that switches between light and dark. It uses `useSyncExternalStore` to handle the mount/unmount cycle safely during SSR hydration.

```tsx
import ThemeToggle from '@/ui/components/theme-toggle';

<ThemeToggle />
<ThemeToggle className="ml-auto" />
```

### CSS variables

Both themes define the same set of variables. To customize the palette, edit `src/ui/styles/globals.css`:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  /* … */
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  /* … */
}
```

## Helpers

### cn

The `cn` helper merges class names using `clsx` and resolves Tailwind conflicts via `tailwind-merge`:

```ts
import { cn } from '@/ui/helpers';

cn('px-2 py-1', condition && 'bg-red-500', 'px-4');
// → 'py-1 bg-red-500 px-4'  (px-2 overridden by px-4)
```

## Icons

Icons are centralized in `src/ui/icons/index.ts` via the `ICONS` registry. The goal is consistency: every component imports from the same registry instead of referencing icon objects directly. This ensures the same icon is reused across the app and can be swapped in one place without touching component code.

```ts
import { ICONS } from '@/ui/icons';
import { HugeiconsIcon } from '@hugeicons/react';

<HugeiconsIcon icon={ICONS.themeDark} />
```

To add a new icon, import it from `@hugeicons/core-free-icons` and add it to the `ICONS` registry — then use `ICONS.myIcon` everywhere.

## Hooks

### useIsMounted

The `useIsMounted` hook (`src/ui/hooks/use-is-mounted.ts`) wraps `useSyncExternalStore` to safely detect whether the component is mounted on the client. It returns `false` during SSR and `true` after hydration, preventing flash-of-incorrect-state in components that depend on client-only APIs (theme, localStorage, etc.).

```tsx
import { useIsMounted } from '@/ui/hooks/use-is-mounted';

const mounted = useIsMounted();
if (!mounted) return null;
```

## Storybook

[Storybook](https://storybook.js.org) 10 is configured with the Next.js + Vite framework. It provides an isolated environment for developing and visually testing UI components.

### Commands

```bash
pnpm sb              # start Storybook dev server (http://localhost:6006)
pnpm build:sb        # build static Storybook bundle
```

### Addons

| Addon                      | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `@chromatic-com/storybook` | Chromatic integration for visual regression |
| `@storybook/addon-vitest`  | Run component tests in Vitest               |
| `@storybook/addon-a11y`    | Accessibility checks in the Storybook panel |
| `@storybook/addon-docs`    | MDX documentation pages                     |
| `@storybook/addon-mcp`     | MCP server for AI-driven Storybook access   |

### Writing stories

Stories are colocated with components using the `.stories.tsx` suffix. The glob pattern `src/**/*.stories.@(js|jsx|mjs|ts|tsx)` is configured in `.storybook/main.ts`.

```tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import MyComponent from './my-component';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {};
```

### Mocks

Storybook aliases server-only modules to lightweight mocks in `.storybook/mocks/`:

- `@/core/env` → `.storybook/mocks/env.ts`
- `@/core/i18n/navigation` → `.storybook/mocks/navigation.ts`
- `@/core/observability/logger` → `.storybook/mocks/logger.ts`

## Dev tools

Development-only components live in `src/ui/components/dev/`. They are gated by `process.env.NODE_ENV !== 'development'` and render nothing in production builds.

### ScreenSize

The `ScreenSize` component (`src/ui/components/dev/screen-size.tsx`) is a floating breakpoint badge that displays the current Tailwind breakpoint (XS → 2XL). It is mounted once in the root layout and helps developers verify responsive behavior at a glance.

**Features:**

- **Breakpoint label** — shows the active breakpoint (XS, SM, MD, LG, XL, 2XL).
- **Size** — adjustable badge size (Small, Medium, Large).
- **Position** — dockable to any screen corner (Bottom Left, Bottom Right, Top Left, Top Right).
- **Colored mode** — color-codes the badge per breakpoint for quick visual identification.
- **Persistence** — preferences are stored in `localStorage` via a [Zustand](https://github.com/pmndrs/zustand) store (`src/ui/components/dev/screen-size.store.ts`) with `persist` and `devtools` middleware.
