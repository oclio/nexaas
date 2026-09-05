'use client';

import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useTranslations } from 'next-intl';

import { useOtpVerification } from '@/app/[locale]/(auth)/login/_components/hooks/use-otp-verification';
import { renderStrong } from '@/core/i18n/helpers/render-rich';
import CountdownButton from '@/ui/components/forms/countdown-button';
import type { StepComponentProps } from '@/ui/components/forms/multi-step-form';
import OtpField from '@/ui/components/forms/otp-field';
import PendingButton from '@/ui/components/forms/pending-button';
import { Button } from '@/ui/components/shadcn/button';
import { FieldGroup } from '@/ui/components/shadcn/field';
import { Separator } from '@/ui/components/shadcn/separator';

export default function StepOtpVerification({
  goTo,
}: Readonly<StepComponentProps>) {
  const t = useTranslations();
  const {
    otpForm,
    isPending,
    isSubmitted,
    email,
    handleSubmit,
    handleResendOtp,
  } = useOtpVerification();

  return (
    <form onSubmit={otpForm.handleSubmit(handleSubmit)} noValidate={true}>
      <FieldGroup className="gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-center text-sm">
            {t.rich('pages.login.codeSent.description', {
              email,
              strong: renderStrong(),
            })}
          </p>
        </div>

        <OtpField
          name="code"
          control={otpForm.control}
          label={t('pages.login.codeLabel')}
          labelClassName="required"
          disabled={isPending || isSubmitted}
          onComplete={() => otpForm.handleSubmit(handleSubmit)()}
          pattern={REGEXP_ONLY_DIGITS}
        />

        <PendingButton
          pending={isPending}
          disabled={!otpForm.formState.isValid || isSubmitted || isPending}
          pendingLabel={t('pages.login.verifyCode')}
          className="mx-auto w-fit"
        >
          {t('pages.login.verifyCode')}
        </PendingButton>

        <Separator />

        <div className="flex flex-col items-center gap-2">
          <CountdownButton
            variant="outline"
            seconds={60}
            onAction={handleResendOtp}
            label={t('pages.login.resendCode')}
            disabled={isPending || isSubmitted}
          />

          <Button
            variant="link"
            size="sm"
            disabled={isPending || isSubmitted}
            onClick={() => goTo('login')}
            className="text-muted-foreground"
          >
            {t('pages.login.backToEmail')}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
