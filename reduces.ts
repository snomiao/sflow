import type { Awaitable } from "./Awaitable";
type Reducer<S, T> = (state: S, x: T, i: number) => Awaitable<S>;
type ReducerWithUndefinedInitialState<T> = (
  state: T | undefined,
  x: T,
  i: number
) => Awaitable<T>;

/** return undefined to skip emit */
export const reduces: {
  // 
  <T>(fn: ReducerWithUndefinedInitialState<T>): TransformStream<T, T>;
  <T>(fn: Reducer<T, T>, initialState: T): TransformStream<T, T>;
  // 
  <T, S>(fn: Reducer<S, T>): TransformStream<T, S>;
  <T, S>(fn: Reducer<S, T>, initialState: S): TransformStream<T, S>;
} = <S>(fn: Function, state?: S) => {
  let i = 0;
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      state = await fn(state, chunk, i++);
      ctrl.enqueue(state);
    },
  });
};
