'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { type ComponentProps, useSyncExternalStore } from 'react';

import { Button } from '@/ui/components/shadcn/button';
import { ICONS } from '@/ui/icons';

const noop = () => {
  /*
  No cleanup required
  */
};
const emptySubscribe = () => noop;

export default function ThemeToggle({
  className,
  ...props
}: Readonly<ComponentProps<typeof Button>>) {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('components.themeToggle');

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const isDark = mounted && theme === 'dark';

  return (
    <Button
      variant="outline"
      size="sm"
      {...props}
      className={`group relative size-7 min-w-6 cursor-pointer ${className}`}
      onClick={() =>
        mounted &&
        setTheme((previous) => (previous === 'dark' ? 'light' : 'dark'))
      }
      aria-label={t(isDark ? 'toggleLight' : 'toggleDark')}
      data-testid="theme-toggle"
    >
      <HugeiconsIcon
        icon={ICONS.themeDark}
        className={`size-4 shrink-0 transition-all ${
          isDark ? 'scale-100 opacity-100' : 'absolute scale-0 opacity-0'
        }`}
        aria-hidden="true"
      />
      <HugeiconsIcon
        icon={ICONS.themeLight}
        className={`size-4 shrink-0 transition-all ${
          isDark ? 'absolute scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-hidden="true"
      />
    </Button>
  );
}
