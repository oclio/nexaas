import { vi } from 'vitest';

import { axiomClientReference } from '@/tests/unit/mocks/observability';

import { checkAxiomService } from '../index';

const datasetsGetMock = vi.fn();

describe('checkAxiomService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    datasetsGetMock.mockReset();
    axiomClientReference.value = undefined;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    axiomClientReference.value = undefined;
  });

  it('returns disabled when axiomClient is undefined', async () => {
    vi.stubEnv('AXIOM_DATASET', 'test-dataset');

    const result = await checkAxiomService();

    expect(result).toMatchObject({ status: 'disabled' });
  });

  it('returns disabled when AXIOM_DATASET is not set', async () => {
    vi.stubEnv('AXIOM_DATASET', undefined as unknown as string);
    axiomClientReference.value = { datasets: { get: datasetsGetMock } };

    const result = await checkAxiomService();

    expect(result).toMatchObject({ status: 'disabled' });
  });

  it('returns healthy when datasets.get succeeds', async () => {
    const dataset = 'test-dataset';
    vi.stubEnv('AXIOM_DATASET', dataset);
    axiomClientReference.value = { datasets: { get: datasetsGetMock } };
    datasetsGetMock.mockResolvedValue({ id: dataset });

    const result = await checkAxiomService();

    expect(result).toMatchObject({ status: 'healthy' });
    expect(datasetsGetMock).toHaveBeenCalledWith(dataset);
  });

  it.each([
    { name: 'connection error', message: 'connection refused' },
    { name: 'timeout error', message: 'Operation timed out after 2000ms' },
  ])(
    'returns unhealthy with error message when datasets.get throws ($name)',
    async ({ message }) => {
      vi.stubEnv('AXIOM_DATASET', 'test-dataset');
      axiomClientReference.value = { datasets: { get: datasetsGetMock } };
      datasetsGetMock.mockRejectedValue(new Error(message));

      const result = await checkAxiomService();

      expect(result).toMatchObject({
        status: 'unhealthy',
        error: expect.any(String),
      });
      expect((result as { error: string }).error).toBe(message);
    },
  );
});
