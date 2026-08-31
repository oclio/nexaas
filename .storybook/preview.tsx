import '@/core/ui/css/globals.css';

import type { Preview } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import React from 'react';

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
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale || 'en';
      const messages =
        messagesMap[locale as keyof typeof messagesMap] || enMessages;

      return (
        <NextIntlClientProvider
          key={locale}
          locale={locale}
          messages={messages}
        >
          <Story />
        </NextIntlClientProvider>
      );
    },
  ],
};

export default preview;
