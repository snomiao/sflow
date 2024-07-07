import type { Awaitable } from "./Awaitable";


export function forEachs<T>(fn: (x: T, i: number) => Awaitable<void | any>) {
  let i = 0;
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      await fn(chunk, i++);
      ctrl.enqueue(chunk);
    },
  });
}
