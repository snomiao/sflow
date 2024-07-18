import type { Ord } from "rambda";
import type { Awaitable } from "./Awaitable";

/** chunk items if condition is true */
export function chunkIfs<T>(
  predicate: (x: T, i: number, chunks: T[]) => Awaitable<boolean>
): TransformStream<T, T[]> {
  let chunks: T[] = [];
  let i = 0;
  return new TransformStream<T, T[]>({
    transform: async (chunk, ctrl) => {
      chunks.push(chunk);
      if (!(await predicate(chunk, i++, chunks)))
        ctrl.enqueue(chunks.splice(0, Infinity)); // clear chunks;
    },
    flush: async (ctrl) => void (chunks.length && ctrl.enqueue(chunks)),
  });
}
