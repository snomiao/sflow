import type { Awaitable } from "./Awaitable";


export function maps<T, R>(fn: (x: T, i: number) => Awaitable<R>) {
  let i = 0;
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => ctrl.enqueue(await fn(chunk, i++)),
  });
}
