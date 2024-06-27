import { limits } from "./limits";
import { skips } from "./skips";

export function slices<T>(start = 0, end = Infinity) {
  const count = end - start;
  const { readable, writable } = new TransformStream<T, T>();
  return {
    writable,
    readable: readable.pipeThrough(skips(start)).pipeThrough(limits(count)),
  };
}
