import type { Awaitable } from "./Awaitable";

type asyncMapOptions = {
  concurrency?: number;
};

/** For each loop on stream, you can modify the item by x.property = 123 */
export function forEachs<T>(
  fn: (x: T, i: number) => Awaitable<undefined | unknown>,
  options?: asyncMapOptions,
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
  const promises: Awaitable<undefined | unknown>[] = [];
  const chunks: T[] = [];
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      promises.push(fn(chunk, i++));
      chunks.push(chunk);
      if (promises.length >= concurrency) {
        await promises.shift();
        const chunk = chunks.shift();
        if (chunk === undefined)
          throw new Error("chunks.shift() returned undefined");
        ctrl.enqueue(chunk);
      }
    },
    flush: async (ctrl) => {
      while (promises.length) {
        await promises.shift();
        const chunk = chunks.shift();
        if (chunk === undefined)
          throw new Error("chunks.shift() returned undefined");
        ctrl.enqueue(chunk);
      }
    },
  });
}
