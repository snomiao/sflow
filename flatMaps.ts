import type { Awaitable } from "./Awaitable";

// from([1, 2, 3]).pipeThrough(filters());

export function flatMaps<T, R>(fn: (x: T, i: number) => Awaitable<R[]>) {
  let i = 0;
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => {
      (await fn(chunk, i++)).map((e) => ctrl.enqueue(e));
    },
  });
}
