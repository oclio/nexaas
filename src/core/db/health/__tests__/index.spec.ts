import { vi } from 'vitest';

const executeMock = vi.hoisted(() => vi.fn());
vi.mock('@/core/db/index', () => ({
  db: { execute: executeMock },
}));

const withTimeoutMock = vi.hoisted(() =>
  vi.fn((promise: Promise<unknown>) => promise),
);
vi.mock('@/core/async/helpers/with-timeout', () => ({
  withTimeout: withTimeoutMock,
}));

const sqlMock = vi.hoisted(() => vi.fn(() => ({})));
vi.mock('drizzle-orm', () => ({ sql: sqlMock }));

const { checkDatabaseService } = await import('../index');

describe('checkDatabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns healthy when SELECT 1 succeeds', async () => {
    executeMock.mockResolvedValue({ rows: [{ '?column?': 1 }] });

    const result = await checkDatabaseService();

    expect(result.status).toBe('healthy');
    expect(executeMock).toHaveBeenCalled();
    expect(withTimeoutMock).toHaveBeenCalledWith(expect.any(Promise), 3000);
    expect(sqlMock.mock.calls[0][0][0]).not.toBe('');
  });

  it.each([
    {
      name: 'when the query throws',
      errorMessage: 'connection refused',
      expected: /connection refused/i,
    },
    {
      name: 'when the query times out',
      errorMessage: 'Operation timed out',
      expected: /timed out/i,
    },
  ])('returns unhealthy $name', async ({ errorMessage, expected }) => {
    executeMock.mockRejectedValue(new Error(errorMessage));

    const result = await checkDatabaseService();

    expect(result.status).toBe('unhealthy');
    expect(result.error).toMatch(expected);
  });

  it('returns unhealthy with undefined error when a non-Error value is thrown', async () => {
    executeMock.mockRejectedValue('fail' as never);

    const result = await checkDatabaseService();

    expect(result.status).toBe('unhealthy');
    expect(result.error).toBeUndefined();
  });
});
