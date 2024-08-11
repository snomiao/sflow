import type { Awaitable } from "./Awaitable";

type asyncMapOptions = {
  concurrency?: number;
};

/* map a stream by parallel, return them in original order */
export const pMaps: {
  <T, R>(
    fn: (x: T, i: number) => Awaitable<R>,
    options?: asyncMapOptions,
  ): TransformStream<T, R>;
  // <T, R>(fn: (x: T, i: number) => Awaitable<R>): TransformStream<T, R>;
} = <T, R>(
  fn: (x: T, i: number) => Awaitable<R>,
  options: asyncMapOptions = {},
) => {
  let i = 0;
  let promises: Awaitable<R>[] = [];
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => {
      promises.push(fn(chunk, i++));
      if (promises.length >= (options.concurrency ?? Infinity))
        ctrl.enqueue(await promises.shift());
    },
    flush: async (ctrl) => {
      while (promises.length) ctrl.enqueue(await promises.shift());
    },
  });
};
