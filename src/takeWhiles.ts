import type { Awaitable } from "./Awaitable";
import { never } from "./never";

/**
 * Takes elements from the stream while the predicate returns true.
 * Stops and terminates the stream when the predicate returns false.
 *
 * @param fn Predicate function that determines whether to continue taking elements
 * @returns A TransformStream that takes elements while the predicate is true
 * @template T The type of the input/output stream
 * @example
 * sflow([1, 2, 3, 4, 5])
 *   .takeWhile(x => x < 4)
 *   .toArray() // [1, 2, 3]
 */
export function takeWhiles<T>(
  fn: (x: T, i: number) => Awaitable<unknown>,
  { terminate = true } = {},
) {
  let i = 0;
  let stopped = false;
  return new TransformStream<T, T>(
    {
      transform: async (chunk, ctrl) => {
        if (stopped) return;
        const shouldContinue = await fn(chunk, i++);
        if (shouldContinue) {
          ctrl.enqueue(chunk);
        } else {
          stopped = true;
          if (terminate) {
            ctrl.terminate();
            return never();
          }
        }
      },
      flush: () => {},
    },
    { highWaterMark: 1 },
    { highWaterMark: 0 },
  );
}
