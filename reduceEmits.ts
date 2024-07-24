import type { Awaitable } from "./Awaitable";
export const reduceEmits: {
  <T, S, R>(
    fn: (state: S, x: T, i: number) => Awaitable<{ state: S; emit: R }>,
    state: S
  ): TransformStream<T, R>;
} = (fn, _state) => {
  let i = 0;
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      const { state, emit } = await fn(_state, chunk, i++);
      _state = state;
      ctrl.enqueue(emit);
    },
  });
};
