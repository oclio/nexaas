import { TimeoutError } from '@/core/async/errors/timeout-error';

export async function withTimeout<T>(
  promise: Promise<T>,
  ms = 2000,
  errorMessage?: string,
): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new TimeoutError(errorMessage ?? `Operation timed out after ${ms}ms`),
      );
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId); // Prevents memory leaks from dangling timers
    }
  }
}
