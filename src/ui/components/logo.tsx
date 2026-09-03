'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { app } from '@/config';
import { cn } from '@/ui/helpers';

/**
 * Examples:
 * <Logo />
 * <Logo className="[--logo-size:2.5rem]" />
 * <Logo className="[&_span]:hidden sm:[&_span]:block" />
 * <Logo className="[--logo-size:20px] text-blue-600 [&_span]:text-sm" />
 */

interface Props {
  className?: string; // Everything goes through here now
  priority?: boolean;
}

export default function Logo({ className, priority = false }: Readonly<Props>) {
  const t = useTranslations('components.logo');

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="relative size-(--logo-size,1.25rem) shrink-0">
        <Image
          src={app.logo}
          alt={t('alt', { app: app.title })}
          fill
          priority={priority}
          sizes="2.5rem"
          className="object-contain"
        />
      </div>
      <span className="font-heading truncate text-base font-medium tracking-tight text-zinc-700 dark:text-zinc-400">
        {app.title}
      </span>
    </div>
  );
}
