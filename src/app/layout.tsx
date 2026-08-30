import '@/ui/styles/globals.css';
import '@/core/config/env';

import type { Metadata } from 'next';
import { ReactNode } from 'react';

import { ThemeProvider } from '@/app/(main)/_components/theme-provider';
import { app } from '@/core/config';
import { WebVitals } from '@/core/observability/axiom/components/web-vitals';
import { fontHeading, fontSans } from '@/ui/fonts';
import { cn } from '@/ui/helpers';

export const metadata: Metadata = {
  title: app.title,
  description: app.description,
  icons: {
    icon: app.logo,
  },
};

interface Props {
  children: ReactNode;
}

export default function RootLayout({ children }: Readonly<Props>) {
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
          <main className="flex flex-1 flex-col">{children}</main>
          <WebVitals />
        </ThemeProvider>
      </body>
    </html>
  );
}
