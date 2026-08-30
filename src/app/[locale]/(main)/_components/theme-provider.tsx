'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps, ReactNode } from 'react';

interface Properties extends ComponentProps<typeof NextThemesProvider> {
  children: ReactNode;
}

// Silence the false-positive React 19 warning in development
if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...arguments_: unknown[]) => {
    if (
      typeof arguments_[0] === 'string' &&
      arguments_[0].includes('Encountered a script tag')
    ) {
      return;
    }
    originalError.apply(console, arguments_);
  };
}

export function ThemeProvider({
  children,
  ...properties
}: Readonly<Properties>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...properties}
    >
      {children}
    </NextThemesProvider>
  );
}
