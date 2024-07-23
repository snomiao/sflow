import type { Awaitable } from "./Awaitable";
/** return undefined to skip emit */
export const reduces: {
  <T>(
    fn: (state: T | undefined, x: T, i: number) => Awaitable<T | undefined>
  ): TransformStream<T, T>;
  <T, S>(
    fn: (state: S, x: T, i: number) => Awaitable<S | undefined>
  ): TransformStream<T, S>;
  
  <T>(
    state: T,
    fn: (state: T, x: T, i: number) => Awaitable<T>
  ): TransformStream<T, T>;
  <T, S>(
    state: S,
    fn: (state: S, x: T, i: number) => Awaitable<S | undefined>
  ): TransformStream<T, S>;
} = (...args: any[]) => {
  const fn =
    typeof args[1] === "function"
      ? args[1]
      : typeof args[0] === "function"
      ? args[0]
      : undefined;
  let state = typeof args[1] === "function" ? args[0] : undefined;
  let i = 0;
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      const next = await fn(state, chunk, i++);
      return ctrl.enqueue((state = next));
    },
  });
};
