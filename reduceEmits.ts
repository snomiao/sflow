import type { Awaitable } from "./Awaitable";
export const reduceEmits: {
  <T, S, R>(
    fn: (state: S, x: T, i: number) => Awaitable<{ next: S; emit: R }>,
    state: S
  ): TransformStream<T, R>;
} = (fn, state) => {
  let i = 0;
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      const { next, emit } = await fn(state, chunk, i++);
      state = next;
      ctrl.enqueue(emit);
    },
  });
};
