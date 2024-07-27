import type { AsyncOrSync } from "ts-essentials";

export function maps<T, R>(fn: (x: T, i: number) => AsyncOrSync<R>) {
  let i = 0;
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => {
      const ret = fn(chunk, i++);

      // await only if ret is promise, to ensure performance
      const val = ret instanceof Promise ? await ret : ret;

      ctrl.enqueue(val);
    },
  });
}
