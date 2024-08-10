/**
 * Collect items into lists, but collect item[] in interval (ms)
 * Note: will emit all 
 */
export function chunkIntervals<T>(interval: number =0) {
  let chunks: T[] = [];
  let id: null | ReturnType<typeof setInterval> = null;
  return new TransformStream<T, T[]>({
    start: (ctrl) => {
      id = setInterval(() => ctrl.enqueue(chunks.splice(0,Infinity)), interval);
    },
    transform: async (chunk) => {
      chunks.push(chunk);
    },
    flush: async (ctrl) => {
      if (chunks.length) ctrl.enqueue(chunks.splice(0,Infinity));
      id !== null && clearInterval(id);
    },
  });
}
