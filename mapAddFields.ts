import type { Awaitable } from "./Awaitable";


export function mapAddFields<
  K extends string,
  T extends Record<string, any>,
  R extends any
>(key: K, fn: (x: T, i: number) => Awaitable<R>) {
  let i = 0;
  return new TransformStream<T, Omit<T, K> & {
    [key in K]: R;
  }>({
    transform: async (chunk, ctrl) => ctrl.enqueue({ ...chunk, [key]: await fn(chunk, i++) }),
  });
}
