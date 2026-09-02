'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ComponentProps, useState } from 'react';

import LocaleSwitcher from '@/core/i18n/components/locale-switcher';
import { navigation } from '@/navigation';
import Logo from '@/ui/components/logo';
import { Button } from '@/ui/components/shadcn/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/ui/components/shadcn/sheet';
import ThemeToggle from '@/ui/components/theme-toggle';
import { ICONS } from '@/ui/icons';

import { NavLink } from '../nav-link';

interface Props extends ComponentProps<typeof Button> {
  pathname: string;
  activeSection: string;
}

export default function MobileMenu({
  className,
  pathname,
  activeSection,
  ...props
}: Readonly<Props>) {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  const items = navigation.filter((item) =>
    item.location.includes('mobileMenu'),
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            className={`size-7 ${className} cursor-pointer`}
            aria-label={t('labels.menu')}
            {...props}
          >
            <HugeiconsIcon
              icon={ICONS.menu}
              className="size-3.5"
              aria-hidden="true"
            />
          </Button>
        }
      />

      <SheetContent
        showCloseButton={false}
        side="left"
        className="flex h-full w-75 flex-col gap-6 p-4"
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">{t('labels.menu')}</SheetTitle>

        <header className="flex items-center justify-between">
          <SheetClose
            render={
              <Link href="/">
                <Logo />
              </Link>
            }
          />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LocaleSwitcher align="end" />
          </div>
        </header>

        <nav className="flex h-full flex-col gap-8 text-sm">
          <div className="flex grow flex-col gap-4">
            {items.map((item) => (
              <SheetClose
                key={item.label}
                render={
                  <NavLink
                    href={item.href}
                    label={t(item.label)}
                    pathname={pathname}
                    activeSection={activeSection}
                    className="link-icon transition-all duration-300 ease-in-out"
                  />
                }
              />
            ))}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
