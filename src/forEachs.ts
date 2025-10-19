import type { Awaitable } from "./Awaitable";

type asyncMapOptions = {
  concurrency?: number;
};

/** For each loop on stream, you can modify the item by x.property = 123 */
export function forEachs<T>(
  fn: (x: T, i: number) => Awaitable<void | any>,
  options?: asyncMapOptions
) {
  const concurrency = options?.concurrency ?? 1;

  // If concurrency is 1, use simple sequential processing
  if (concurrency === 1) {
    let i = 0;
    return new TransformStream<T, T>({
      transform: async (chunk, ctrl) => {
        const ret = fn(chunk, i++);
        ret instanceof Promise ? await ret : ret;

        ctrl.enqueue(chunk);
      },
    });
  }

  // If concurrency > 1, use parallel processing while maintaining order
  let i = 0;
  let promises: Awaitable<void | any>[] = [];
  let chunks: T[] = [];
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      promises.push(fn(chunk, i++));
      chunks.push(chunk);
      if (promises.length >= concurrency) {
        await promises.shift();
        ctrl.enqueue(chunks.shift()!);
      }
    },
    flush: async (ctrl) => {
      while (promises.length) {
        await promises.shift();
        ctrl.enqueue(chunks.shift()!);
      }
    },
  });
}
