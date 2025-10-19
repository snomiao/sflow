import type { Awaitable } from "./Awaitable";

type asyncMapOptions = {
  concurrency?: number;
};

export function maps<T, R>(
  fn: (x: T, i: number) => Awaitable<R>,
  options?: asyncMapOptions,
): TransformStream<T, R> {
  const concurrency = options?.concurrency ?? 1;

  // If concurrency is 1, use simple sequential processing
  if (concurrency === 1) {
    let i = 0;
    return new TransformStream<T, R>({
      transform: async (chunk, ctrl) => {
        const ret = fn(chunk, i++);
        const val = ret instanceof Promise ? await ret : ret;
        ctrl.enqueue(val);
      },
    });
  }

  // If concurrency > 1, use parallel processing while maintaining order
  let i = 0;
  const promises: Awaitable<R>[] = [];
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => {
      promises.push(fn(chunk, i++));
      if (promises.length >= concurrency) {
        ctrl.enqueue(await promises.shift()!);
      }
    },
    flush: async (ctrl) => {
      while (promises.length) {
        ctrl.enqueue(await promises.shift()!);
      }
    },
  });
}
