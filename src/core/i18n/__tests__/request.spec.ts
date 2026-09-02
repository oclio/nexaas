import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { hasLocale } from 'next-intl';

import requestConfig from '@/core/i18n/request';
import { routing } from '@/core/i18n/routing';

const messagesMock = vi.hoisted(() => ({ default: { greeting: 'hello' } }));

vi.mock('next-intl', async () => {
  const actual = await vi.importActual<typeof import('next-intl')>('next-intl');
  return { ...actual, hasLocale: vi.fn(actual.hasLocale) };
});

vi.mock('next-intl/server', () => ({
  getRequestConfig: (function_: unknown) => function_,
}));

vi.mock('next/root-params', () => ({
  locale: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/../messages/en/index.ts', () => messagesMock);
vi.mock('@/../messages/fr/index.ts', () => messagesMock);

describe('requestConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the locale and messages when locale is provided', async () => {
    const result = await requestConfig({ locale: 'en' } as never);

    expect(result).toEqual({
      locale: 'en',
      messages: messagesMock.default,
    });
    expect(rootParams.locale).not.toHaveBeenCalled();
  });

  it('falls back to rootParams when locale is undefined', async () => {
    vi.mocked(rootParams.locale).mockResolvedValue('fr');
    vi.mocked(hasLocale).mockReturnValue(true);

    const result = await requestConfig({ locale: undefined } as never);

    expect(rootParams.locale).toHaveBeenCalledOnce();
    expect(hasLocale).toHaveBeenCalledWith(routing.locales, 'fr');
    expect(result).toEqual({
      locale: 'fr',
      messages: messagesMock.default,
    });
  });

  it('calls notFound when rootParams returns an unsupported locale', async () => {
    vi.mocked(rootParams.locale).mockResolvedValue('de');
    vi.mocked(hasLocale).mockReturnValue(false);

    await expect(requestConfig({ locale: undefined } as never)).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
    expect(notFound).toHaveBeenCalled();
  });
});
