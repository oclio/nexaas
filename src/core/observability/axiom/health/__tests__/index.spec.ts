import { vi } from 'vitest';

const envReference = {
  AXIOM_DATASET: undefined as string | undefined,
};

vi.mock('@/core/config/env', () => ({
  get env() {
    return envReference;
  },
}));

const datasetsGetMock = vi.fn();
const axiomClientReference: { value: unknown } = { value: undefined };
vi.mock('@/core/observability/axiom/client', () => ({
  get axiomClient() {
    return axiomClientReference.value;
  },
}));

vi.mock('@/core/async/helpers/with-timeout', () => ({
  withTimeout: (promise: Promise<unknown>) => promise,
}));

const { checkAxiomService } = await import('../index');

describe('checkAxiomService', () => {
  afterEach(() => {
    vi.clearAllMocks();
    envReference.AXIOM_DATASET = undefined;
    axiomClientReference.value = undefined;
  });

  it('returns disabled when axiomClient is undefined', async () => {
    envReference.AXIOM_DATASET = 'test-dataset';
    axiomClientReference.value = undefined;

    const result = await checkAxiomService();

    expect(result).toEqual({ status: 'disabled' });
  });

  it('returns disabled when AXIOM_DATASET is not set', async () => {
    envReference.AXIOM_DATASET = undefined;
    axiomClientReference.value = { datasets: { get: datasetsGetMock } };

    const result = await checkAxiomService();

    expect(result).toEqual({ status: 'disabled' });
  });

  it('returns healthy when datasets.get succeeds', async () => {
    envReference.AXIOM_DATASET = 'test-dataset';
    axiomClientReference.value = { datasets: { get: datasetsGetMock } };
    datasetsGetMock.mockResolvedValue({ id: 'test-dataset' });

    const result = await checkAxiomService();

    expect(result).toEqual({ status: 'healthy' });
    expect(datasetsGetMock).toHaveBeenCalledWith('test-dataset');
  });

  it('returns unhealthy with error message when datasets.get throws', async () => {
    envReference.AXIOM_DATASET = 'test-dataset';
    axiomClientReference.value = { datasets: { get: datasetsGetMock } };
    datasetsGetMock.mockRejectedValue(new Error('connection refused'));

    const result = await checkAxiomService();

    expect(result).toEqual({
      status: 'unhealthy',
      error: 'connection refused',
    });
  });

  it('returns unhealthy with error message when withTimeout throws TimeoutError', async () => {
    envReference.AXIOM_DATASET = 'test-dataset';
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
