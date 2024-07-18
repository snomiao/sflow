import type { Awaitable } from "./Awaitable";
export const reduceEmits: {
  <T, S, R>(
    state: S,
    fn: (state: S, x: T, i: number) => Awaitable<{ next: S; emit: R }>
  ): TransformStream<T, R>;
} = (state, fn) => {
  let i = 0;
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      const { next, emit } = await fn(state, chunk, i++);
      state = next;
      ctrl.enqueue(emit);
    },
  });
};
