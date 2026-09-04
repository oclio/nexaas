'use client';

import { Orbit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTranslations } from 'next-intl';
import { ComponentProps } from 'react';

import { Button } from '@/ui/components/shadcn/button';
import { cn } from '@/ui/helpers';

interface Props extends ComponentProps<typeof Button> {
  pending: boolean;
  pendingLabel: string;
  pendingLabelClassName?: string;
}

export default function PendingButton({
  children,
  pendingLabel,
  pendingLabelClassName,
  pending,
  disabled,
  ...props
}: Readonly<Props>) {
  const t = useTranslations('labels');

  if (!pendingLabel) {
    pendingLabel = t('loading');
  }

  return (
    <Button
      {...props}
      disabled={pending || disabled}
      className={cn(props.className)}
    >
      {pending ? (
        <>
          <HugeiconsIcon
            icon={Orbit01Icon}
            className="animate-spin"
            aria-label={t('loading')}
            aria-hidden={!!pendingLabel}
          />
          <span className={cn('italic', pendingLabelClassName)}>
            {pendingLabel}...
          </span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
