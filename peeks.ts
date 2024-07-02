import type { Awaitable } from "./Awaitable";


export function peeks<T>(fn: (x: T, i: number) => Awaitable<void | any>) {
  let i = 0;
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      ctrl.enqueue(chunk);
      await fn(chunk, i++);
    },
  });
}
