import type { Awaitable } from "./Awaitable";

/** chunk items if condition is true */
export function chunkIfs<T>(
  predicate: (x: T, i: number, chunks: T[]) => Awaitable<boolean>,
  { inclusive = false } = {},
): TransformStream<T, T[]> {
  const chunks: T[] = [];
  let i = 0;
  return new TransformStream<T, T[]>({
    transform: async (chunk, ctrl) => {
      const cond = await predicate(chunk, i++, chunks);
      if (!inclusive && !cond)
        chunks.length && ctrl.enqueue(chunks.splice(0, Infinity)); // clear chunks;
      chunks.push(chunk);
      if (!cond) ctrl.enqueue(chunks.splice(0, Infinity)); // enqueue current chunk
    },
    flush: async (ctrl) => void (chunks.length && ctrl.enqueue(chunks)),
  });
}
