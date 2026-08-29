import { Inter, Montserrat } from 'next/font/google';

export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  preload: false,
});

export const fontHeading = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  preload: false,
});
