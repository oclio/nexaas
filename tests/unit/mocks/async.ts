import { vi } from 'vitest';

export const withTimeoutMock = vi.fn(
  <T>(promise: Promise<T>): Promise<T> => promise,
);

vi.mock('@/core/async/helpers/with-timeout', () => ({
  withTimeout: withTimeoutMock,
}));
