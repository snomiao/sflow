import type { Awaitable } from "./Awaitable";


export const reduces: {
  <T, S>(
    state: S,
    fn: (state: S, x: T, i: number) => Awaitable<S>
  ): TransformStream<T, S>;
  <T>(fn: (state: T | null, x: T, i: number) => Awaitable<T>): TransformStream<
    T, T
  >;
} = (...args: any[]) => {
  const fn = typeof args[1] === "function"
    ? args[1]
    : typeof args[0] === "function"
      ? args[0]
      : null;
  let state = typeof args[1] === "function" ? args[0] : null;
  let i = 0;
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      return ctrl.enqueue((state = await fn(state, chunk, i++)));
    },
  });
};
