import { TimeoutError } from '@/core/async/errors/timeout-error';
import { withTimeout } from '@/core/async/helpers/with-timeout';

describe('withTimeout', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves with the value when the promise completes in time', async () => {
    vi.useFakeTimers();
    const promise = Promise.resolve('result');

    const result = await withTimeout(promise, 1000);

    expect(result).toBe('result');
  });

  it('rejects with TimeoutError when the promise takes too long', async () => {
    vi.useFakeTimers();
    const promise = new Promise((resolve) => setTimeout(resolve, 5000));

    const pending = withTimeout(promise, 100);
    vi.advanceTimersByTime(100);

    await expect(pending).rejects.toThrow(TimeoutError);
  });

  it('uses the default timeout message when none is provided', async () => {
    vi.useFakeTimers();
    const promise = new Promise((resolve) => setTimeout(resolve, 5000));

    const pending = withTimeout(promise, 2000);
    vi.advanceTimersByTime(2000);

    await expect(pending).rejects.toThrow('Operation timed out after 2000ms');
  });

  it('uses a custom error message when provided', async () => {
    vi.useFakeTimers();
    const promise = new Promise((resolve) => setTimeout(resolve, 5000));

    const pending = withTimeout(promise, 100, 'Custom timeout');
    vi.advanceTimersByTime(100);

    await expect(pending).rejects.toThrow('Custom timeout');
  });

  it('defaults to 2000ms when no timeout is specified', async () => {
    vi.useFakeTimers();
    const promise = new Promise((resolve) => setTimeout(resolve, 5000));

    const pending = withTimeout(promise);
    vi.advanceTimersByTime(2000);

    await expect(pending).rejects.toThrow('Operation timed out after 2000ms');
  });

  it('clears the timer when the promise resolves in time', async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const promise = Promise.resolve('fast');

    await withTimeout(promise, 1000);

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('clears the timer when the promise rejects in time', async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const promise = Promise.reject(new Error('fail'));

    await expect(withTimeout(promise, 1000)).rejects.toThrow('fail');

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('propagates the original rejection when the promise rejects before timeout', async () => {
    vi.useFakeTimers();
    const originalError = new Error('connection refused');
    const promise = Promise.reject(originalError);

    await expect(withTimeout(promise, 5000)).rejects.toBe(originalError);
  });

  it('rejects with TimeoutError that has the correct code and status', async () => {
    vi.useFakeTimers();
    const promise = new Promise((resolve) => setTimeout(resolve, 5000));

    const pending = withTimeout(promise, 100);
    vi.advanceTimersByTime(100);

    try {
      await pending;
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(TimeoutError);
      expect((error as TimeoutError).code).toBe('TIMEOUT');
      expect((error as TimeoutError).statusCode).toBe(504);
    }
  });

  it('does not call clearTimeout when setTimeout returns undefined', async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, 'setTimeout').mockReturnValue(undefined as never);
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const promise = Promise.resolve('result');

    await withTimeout(promise, 1000);

    expect(clearTimeoutSpy).not.toHaveBeenCalled();
  });
});
