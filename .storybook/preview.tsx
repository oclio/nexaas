import '@/ui/styles/globals.css';

import type { Preview } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';

import enMessages from '../messages/en';
import frMessages from '../messages/fr';

const messagesMap = {
  en: enMessages,
  fr: frMessages,
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    viewport: {
      options: {
        xs: {
          name: 'XS (Mobile)',
          styles: { width: '375px', height: '667px' },
        },
        sm: {
          name: 'SM (Tailwind)',
          styles: { width: '640px', height: '800px' },
        },
        md: {
          name: 'MD (Tailwind)',
          styles: { width: '768px', height: '1024px' },
        },
        lg: {
          name: 'LG (Tailwind)',
          styles: { width: '1024px', height: '768px' },
        },
        xl: {
          name: 'XL (Tailwind)',
          styles: { width: '1280px', height: '800px' },
        },
      },
    },
  },
  globalTypes: {
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', right: '🇺🇸', title: 'English' },
          { value: 'fr', right: '🇫🇷', title: 'Français' },
        ],
      },
    },
    theme: {
      description: 'Theme mode',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale || 'en';
      const theme = context.globals.theme || 'light';
      const messages =
        messagesMap[locale as keyof typeof messagesMap] || enMessages;

      return (
        <ThemeProvider
          key={`${locale}-${theme}`}
          attribute="class"
          defaultTheme={theme}
          forcedTheme={theme}
          enableSystem={false}
        >
          <NextIntlClientProvider
            key={locale}
            locale={locale}
            messages={messages}
          >
            <Story />
          </NextIntlClientProvider>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
