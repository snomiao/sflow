import type { Awaitable } from "./Awaitable";

/** For each loop on stream, you can modify the item by x.property = 123 */
export function forEachs<T>(fn: (x: T, i: number) => Awaitable<void | any>) {
  let i = 0;
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      await fn(chunk, i++);
      ctrl.enqueue(chunk);
    },
  });
}
