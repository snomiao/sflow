import type { Ord } from "rambda";
import type { Awaitable } from "./Awaitable";

/** chunk items by compareFn, group items with same Ord */
export function chunkBys<T>(compareFn: (x: T) => Awaitable<Ord>) {
  let chunks: T[] = [];
  let lastOrder: Ord;
  return new TransformStream<T, T[]>({
    transform: async (chunk, ctrl) => {
      const order = await compareFn(chunk);
      if (lastOrder && lastOrder !== order)
        ctrl.enqueue(chunks.splice(0, Infinity)); // clear chunks;
      chunks.push(chunk);
      lastOrder = order;
    },
    flush: async (ctrl) => void (chunks.length && ctrl.enqueue(chunks)),
  });
}
