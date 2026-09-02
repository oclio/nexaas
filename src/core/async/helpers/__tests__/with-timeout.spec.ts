import { TimeoutError } from '@/core/async/errors/timeout-error';
import { withTimeout } from '@/core/async/helpers/with-timeout';
import { ErrorCode } from '@/core/errors/codes';

describe('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('resolves with the value when the promise completes in time', async () => {
    const promise = Promise.resolve('result');

    const result = await withTimeout(promise, 1000);

    expect(result).toBe('result');
  });

  it('resolves with the value when a delayed promise completes before the timeout', async () => {
    const promise = new Promise<string>((resolve) =>
      setTimeout(() => resolve('delayed'), 100),
    );

    const pending = withTimeout(promise, 1000);
    vi.advanceTimersByTime(100);

    await expect(pending).resolves.toBe('delayed');
  });

  it('rejects with TimeoutError when the promise takes too long', async () => {
    const promise = new Promise((resolve) => setTimeout(resolve, 5000));

    const pending = withTimeout(promise, 100);
    vi.advanceTimersByTime(100);

    await expect(pending).rejects.toThrow(TimeoutError);
  });

  it.each([
    {
      name: 'uses the default message with explicit ms',
      ms: 500,
      errorMessage: undefined,
      expected: /timed out.*500/i,
    },
    {
      name: 'uses a custom error message when provided',
      ms: 100,
      errorMessage: 'Custom timeout',
      expected: /custom timeout/i,
    },
    {
      name: 'defaults to 2000ms when no timeout is specified',
      ms: undefined,
      errorMessage: undefined,
      expected: /timed out.*2000/i,
    },
  ])(
    '$name',
    async ({
      ms,
      errorMessage,
      expected,
    }: {
      ms: number | undefined;
      errorMessage: string | undefined;
      expected: RegExp;
    }) => {
      const promise = new Promise((resolve) => setTimeout(resolve, 5000));

      const pending = withTimeout(promise, ms, errorMessage);
      vi.advanceTimersByTime(ms ?? 2000);

      await expect(pending).rejects.toThrow(expected);
    },
  );

  it('uses an empty string as the error message when provided', async () => {
    const promise = new Promise((resolve) => setTimeout(resolve, 5000));

    const pending = withTimeout(promise, 100, '');
    vi.advanceTimersByTime(100);

    await expect(pending).rejects.toThrow('');
  });

  it('clears the timer when the promise resolves in time', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const promise = Promise.resolve('fast');

    await withTimeout(promise, 1000);

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('clears the timer when the promise rejects in time', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const promise = Promise.reject(new Error('fail'));

    await expect(withTimeout(promise, 1000)).rejects.toThrow('fail');

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('propagates the original rejection when the promise rejects before timeout', async () => {
    const originalError = new Error('connection refused');
    const promise = Promise.reject(originalError);

    await expect(withTimeout(promise, 5000)).rejects.toBe(originalError);
  });

  it('rejects with TimeoutError that has the correct code and status', async () => {
    const promise = new Promise((resolve) => setTimeout(resolve, 5000));

    const pending = withTimeout(promise, 100);
    vi.advanceTimersByTime(100);

    try {
      await pending;
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(TimeoutError);
      expect((error as TimeoutError).code).toBe(ErrorCode.TIMEOUT);
      expect((error as TimeoutError).statusCode).toBe(504);
    }
  });

  it('does not call clearTimeout when setTimeout returns undefined', async () => {
    vi.spyOn(globalThis, 'setTimeout').mockReturnValue(undefined as never);
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const promise = Promise.resolve('result');

    await withTimeout(promise, 1000);

    expect(clearTimeoutSpy).not.toHaveBeenCalled();
  });
});
