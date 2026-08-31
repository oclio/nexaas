---
'nexaas': minor
---

Add Storybook 10, a reusable useIsMounted hook, and a ScreenSize development tool

- Set up Storybook 10 with Next.js + Vite framework, including a11y, vitest, docs, and MCP addons
- Extract the useSyncExternalStore mounted pattern from ThemeToggle into a reusable useIsMounted hook
- Add a ScreenSize dev tool: a floating breakpoint badge with configurable size, position, and colored mode, persisted via a Zustand store
- Improve the Stryker Tailwind ignorer plugin to handle ObjectExpression mutators and reduce cognitive complexity
