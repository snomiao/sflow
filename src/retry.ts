import type { Awaitable } from "./Awaitable";

export function retry<T extends any[], R>(
  onError: (
    error: unknown,
    attempt: number,
    fn: (...args: T) => Promise<R>,
    ...args: T
  ) => Awaitable<R>,
  fn: (...args: T) => Awaitable<R>,
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    let attempt = 0;
    const retryable = async (...retryArgs: T): Promise<R> => {
      try {
        const ret = fn(...retryArgs);
        return ret instanceof Promise ? await ret : ret;
      } catch (error) {
        attempt++;
        const ret = onError(error, attempt, retryable, ...retryArgs);
        return ret instanceof Promise ? await ret : ret;
      }
    };
    return retryable(...args);
  };
}
