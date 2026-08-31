import '@/ui/styles/globals.css';
import '@/core/env';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';

import { ThemeProvider } from '@/app/[locale]/(main)/_components/theme-provider';
import { routing } from '@/core/i18n/routing';
import { WebVitals } from '@/core/observability/axiom/components/web-vitals';
import { createLayoutMetadata } from '@/core/seo';
import ScreenSize from '@/ui/components/dev/screen-size';
import { fontHeading, fontSans } from '@/ui/fonts';
import { cn } from '@/ui/helpers';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>): Promise<Metadata> {
  const { locale } = await params;
  return createLayoutMetadata({ locale });
}

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: Readonly<Props>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={cn(
        'h-full',
        'antialiased',
        fontSans.variable,
        fontHeading.variable,
        'font-sans',
      )}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <main className="flex flex-1 flex-col">{children}</main>
          </NextIntlClientProvider>
          <WebVitals />
        </ThemeProvider>
        <ScreenSize />
      </body>
    </html>
  );
}
