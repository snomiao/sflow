import type { Awaitable } from "./Awaitable";

/** Note: peeks will not await peek fn, use forEachs if you want downstream tobe awaited  */
export function peeks<T>(fn: (x: T, i: number) => Awaitable<void>) {
  let i = 0;
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      ctrl.enqueue(chunk);
      const ret = fn(chunk, i++);
      const val = ret instanceof Promise ? await ret : ret;
    },
  });
}
