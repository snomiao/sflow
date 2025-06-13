import type { Awaitable } from "./Awaitable";

export function maps<T, R>(
  fn: (x: T, i: number) => Awaitable<R>
): TransformStream<T, R> {
  let i = 0;
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => {
      const ret = fn(chunk, i++);
      const val = ret instanceof Promise ? await ret : ret;
      ctrl.enqueue(val);
    },
  });
}
