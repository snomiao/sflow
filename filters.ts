import type { Awaitable } from "./Awaitable";

export const filters: {
  <T>(): TransformStream<T, NonNullable<T>>;
  <T>(fn: (x: T, i: number) => Awaitable<any>): TransformStream<T, T>;
} = (fn?: (...args: any[]) => any) => {
  let i = 0;
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      if (fn) {
        const shouldEnqueue = await fn(chunk, i++);
        if (shouldEnqueue) ctrl.enqueue(chunk);
      } else {
        const isNull = undefined === chunk || null === chunk;
        if (!isNull) ctrl.enqueue(chunk);
      }
    },
  });
};
