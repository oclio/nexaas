import { vi } from 'vitest';

const messagesMock: Record<string, unknown> = {
  pages: { landing: { title: 'Welcome!' } },
};

const translationMock = vi.fn((key: string) => {
  const messages: Record<string, string> = {
    title: 'Welcome!',
  };
  return messages[key] ?? key;
});

vi.mock('next-intl', () => ({
  hasLocale: (locales: readonly string[], locale: string) =>
    locales.includes(locale),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  useLocale: () => 'en',
  useTranslations: () => translationMock,
}));

vi.mock('next-intl/server', () => ({
  getMessages: vi.fn(async () => messagesMock),
  getTranslations: vi.fn(async () => translationMock),
}));

export { messagesMock, translationMock };
