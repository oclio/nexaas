import { vi } from 'vitest';

const messagesMock: Record<string, unknown> = {
  meta: {
    title: 'saaskip',
    description: 'A scalable, production-ready SaaS boilerplate.',
    keywords: ['saas', 'boilerplate', 'nextjs', 'typescript'],
  },
  pages: {
    landing: {
      title: 'Welcome!',
      description: 'A scalable, production-ready SaaS boilerplate for Next.js.',
    },
  },
};

type TranslationMock = ReturnType<typeof vi.fn<(key: string) => string>> & {
  raw: ReturnType<typeof vi.fn<(key: string) => unknown>>;
};

const translationMock = vi.fn((key: string) => {
  const messages: Record<string, string> = {
    title: 'Welcome!',
    description: 'A scalable, production-ready SaaS boilerplate for Next.js.',
  };
  return messages[key] ?? key;
}) as TranslationMock;

// Allow t.raw('keywords') to return the array from messages
translationMock.raw = vi.fn((key: string) => {
  if (key === 'keywords') {
    return ['saas', 'boilerplate', 'nextjs', 'typescript'];
  }
  return key;
});

vi.mock('next-intl', () => ({
  hasLocale: (locales: readonly string[], locale: string) =>
    locales.includes(locale),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  useLocale: () => 'en',
  useTranslations: vi.fn(() => translationMock),
}));

vi.mock('next-intl/server', () => ({
  getMessages: vi.fn(async () => messagesMock),
  getTranslations: vi.fn(async () => translationMock),
}));

const routerPushMock = vi.fn();
const pathnameReference = { current: '/' };

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => pathnameReference.current,
  useRouter: () => ({ push: routerPushMock }),
}));

export {
  // @lintignore
  messagesMock,
  pathnameReference as pathnameRef,
  routerPushMock,
  translationMock,
};
