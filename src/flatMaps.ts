import type { Awaitable } from "./Awaitable";

// from([1, 2, 3]).pipeThrough(filters());

export function flatMaps<T, R>(
  fn: (x: T, i: number) => Awaitable<R[]>,
): TransformStream<T, R> {
  let i = 0;
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => {
      const ret = fn(chunk, i++);

      // await only if ret is promise, to ensure performance
      const val = ret instanceof Promise ? await ret : ret;

      val.map((e) => ctrl.enqueue(e));
    },
  });
}
