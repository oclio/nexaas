'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { app } from '@/config';
import { socialLinks } from '@/navigation';

export default function SocialLinks() {
  const t = useTranslations('components.footer');

  return (
    <div className="flex flex-nowrap items-center gap-4 text-sm">
      {socialLinks.map((link) => (
        <Link
          href={link.href}
          aria-label={t('appOn', {
            app: app.title,
            platform: link.name,
          })}
          key={link.name}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary block"
        >
          <HugeiconsIcon
            icon={link.icon}
            className="size-5"
            aria-hidden="true"
          />
        </Link>
      ))}
    </div>
  );
}
