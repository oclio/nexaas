import '@/ui/styles/globals.css';
import '@/core/config/env';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';

import { ThemeProvider } from '@/app/[locale]/(main)/_components/theme-provider';
import { app } from '@/core/config';
import { routing } from '@/core/i18n/routing';
import { WebVitals } from '@/core/observability/axiom/components/web-vitals';
import { fontHeading, fontSans } from '@/ui/fonts';
import { cn } from '@/ui/helpers';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: app.title,
  description: app.description,
  icons: {
    icon: app.logo,
  },
};

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
      lang="en"
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
      </body>
    </html>
  );
}
