import type { Awaitable } from "./Awaitable";

export function mapMixins<
  T extends Record<string, any>,
  R extends Record<string, any>
>(
  fn: (x: T, i: number) => Awaitable<R>
): TransformStream<T, Omit<T, keyof R> & R> {
  let i = 0;
  return new TransformStream({
    transform: async (chunk, ctrl) =>
      ctrl.enqueue({ ...chunk, ...(await fn(chunk, i++)) }),
  });
}
