'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { ComponentProps } from 'react';

import { usePathname, useRouter } from '@/core/i18n/navigation';
import { supportedLocales } from '@/core/i18n/routing';
import { Button } from '@/ui/components/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/shadcn/dropdown-menu';
import { cn } from '@/ui/helpers';

interface Props extends ComponentProps<typeof Button> {
  align?: ComponentProps<typeof DropdownMenuContent>['align'];
}

export default function LocaleSwitcher({
  align = 'end',
  ...props
}: Readonly<Props>) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const code =
    supportedLocales.find((lang) => lang.code === locale)?.code ?? '';
  const currentCode = code.charAt(0).toUpperCase() + code.slice(1);
  const t = useTranslations('components.localeSwitcher');

  const handleLocaleChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  const content = supportedLocales.map((lang) => {
    const isActive = locale === lang.code;

    return (
      <DropdownMenuItem
        key={lang.code}
        onClick={() => handleLocaleChange(lang.code)}
        aria-label={t('ariaLabel')}
        aria-current={isActive}
        data-testid={`locale-switcher-item-${lang.code}`}
        className={cn(
          'cursor-pointer',
          isActive
            ? 'bg-primary/3 text-primary font-medium'
            : 'text-muted-foreground',
        )}
      >
        {lang.name}
      </DropdownMenuItem>
    );
  });

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            {...props}
            data-testid="locale-switcher-trigger"
            className={cn(
              'size-7 cursor-pointer text-[12px] font-light focus:outline-none focus-visible:ring-0',
              props.className,
            )}
          >
            {currentCode}
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align={align}>{content}</DropdownMenuContent>
    </DropdownMenu>
  );
}
