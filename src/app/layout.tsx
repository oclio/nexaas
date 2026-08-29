import '@/ui/styles/globals.css';

import type { Metadata } from 'next';
import { ReactNode } from 'react';

import { app } from '@/core/config';
import { fontHeading, fontSans } from '@/ui/fonts';

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
      className={`${fontSans.variable} ${fontHeading.variable} h-full font-sans antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
