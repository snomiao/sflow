import type { Awaitable } from "./Awaitable";

/* map a stream by parallel, return them in original order */

export const pMaps: {
  <T, R>(
    fn: (x: T, i: number) => Awaitable<R>,
    options?: { concurrency?: number },
  ): TransformStream<T, R>;
  <T, R>(fn: (x: T, i: number) => Awaitable<R>): TransformStream<T, R>;
} = <T, R>(
  fn: ((x: T, i: number) => Awaitable<R>),
  { concurrency = Infinity } = {}
) => {
    let i = 0;
    let promises: Awaitable<R>[] = [];
    return new TransformStream<T, R>({
      transform: async (chunk, ctrl) => {
        promises.push(fn(chunk, i++));
        if (promises.length >= concurrency) ctrl.enqueue(await promises.shift());
      },
      flush: async (ctrl) => {
        while (promises.length) ctrl.enqueue(await promises.shift());
      },
    });
  };
