import { vi } from 'vitest';

import { axiomClientReference } from '@/tests/unit/mocks/observability';

const datasetsGetMock = vi.fn();

const { checkAxiomService } = await import('../index');

describe('checkAxiomService', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    axiomClientReference.value = undefined;
  });

  it('returns disabled when axiomClient is undefined', async () => {
    vi.stubEnv('AXIOM_DATASET', 'test-dataset');
    axiomClientReference.value = undefined;

    const result = await checkAxiomService();

    expect(result).toEqual({ status: 'disabled' });
  });

  it('returns disabled when AXIOM_DATASET is not set', async () => {
    vi.stubEnv('AXIOM_DATASET', undefined as unknown as string);
    axiomClientReference.value = { datasets: { get: datasetsGetMock } };

    const result = await checkAxiomService();

    expect(result).toEqual({ status: 'disabled' });
  });

  it('returns healthy when datasets.get succeeds', async () => {
    vi.stubEnv('AXIOM_DATASET', 'test-dataset');
    axiomClientReference.value = { datasets: { get: datasetsGetMock } };
    datasetsGetMock.mockResolvedValue({ id: 'test-dataset' });

    const result = await checkAxiomService();

    expect(result).toEqual({ status: 'healthy' });
    expect(datasetsGetMock).toHaveBeenCalledWith('test-dataset');
  });

  it('returns unhealthy with error message when datasets.get throws', async () => {
    vi.stubEnv('AXIOM_DATASET', 'test-dataset');
    axiomClientReference.value = { datasets: { get: datasetsGetMock } };
    datasetsGetMock.mockRejectedValue(new Error('connection refused'));

    const result = await checkAxiomService();

    expect(result).toEqual({
      status: 'unhealthy',
      error: 'connection refused',
    });
  });

  it('returns unhealthy with error message when withTimeout throws TimeoutError', async () => {
    vi.stubEnv('AXIOM_DATASET', 'test-dataset');
    axiomClientReference.value = { datasets: { get: datasetsGetMock } };
    datasetsGetMock.mockRejectedValue(
      new Error('Operation timed out after 2000ms'),
    );

    const result = await checkAxiomService();

    expect(result).toEqual({
      status: 'unhealthy',
      error: 'Operation timed out after 2000ms',
    });
  });
});
