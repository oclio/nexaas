import { vi } from 'vitest';

const executeMock = vi.fn();
vi.mock('@/core/db/index', () => ({
  db: { execute: executeMock },
}));

vi.mock('@/core/async/helpers/with-timeout', () => ({
  withTimeout: vi.fn((promise: Promise<unknown>) => promise),
}));

const { checkDatabaseService } = await import('../index');

describe('checkDatabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns healthy when SELECT 1 succeeds', async () => {
    executeMock.mockResolvedValue({ rows: [{ '?column?': 1 }] });

    const result = await checkDatabaseService();

    expect(result).toEqual({ status: 'healthy' });
    expect(executeMock).toHaveBeenCalledTimes(1);
    const queryArgument = executeMock.mock.calls[0][0] as {
      queryChunks: { value: string[] }[];
    };
    expect(queryArgument.queryChunks[0].value).toContain('SELECT 1');
  });

  it('returns unhealthy when the query throws', async () => {
    executeMock.mockRejectedValue(new Error('connection refused'));

    const result = await checkDatabaseService();

    expect(result).toEqual({
      status: 'unhealthy',
      error: 'connection refused',
    });
  });

  it('returns unhealthy when the query times out', async () => {
    executeMock.mockRejectedValue(new Error('Operation timed out'));

    const result = await checkDatabaseService();

    expect(result.status).toBe('unhealthy');
    expect(result.error).toBe('Operation timed out');
  });
});
