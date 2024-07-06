import type { Awaitable } from "./Awaitable";
/** return undefined or undefined to skip emit  */
export const reduces: {
  <T, S>(
    state: S,
    fn: (state: S, x: T, i: number) => Awaitable<S | undefined>
  ): TransformStream<T, S>;
  <T>(
    fn: (state: T | null, x: T, i: number) => Awaitable<T | undefined>
  ): TransformStream<T, T>;
} = (...args: any[]) => {
  const fn =
    typeof args[1] === "function"
      ? args[1]
      : typeof args[0] === "function"
        ? args[0]
        : null;
  let state = typeof args[1] === "function" ? args[0] : null;
  let i = 0;
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      const next = await fn(state, chunk, i++);
      if (undefined !== next) return ctrl.enqueue((state = next));
    },
  });
};
