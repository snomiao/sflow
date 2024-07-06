/** like buffer, but collect item[] in interval (ms) */
export function chunkIntervals<T>(interval?: number) {
  let chunks: T[] = [];
  let id: null | ReturnType<typeof setInterval> = null;
  return new TransformStream<T, T[]>({
    start: (ctrl) => {
      if (interval) id = setInterval(() => ctrl.enqueue(chunks), interval);
    },
    transform: async (chunk, ctrl) => {
      if (!interval) ctrl.enqueue([chunk]);
      chunks.push(chunk);
    },
    flush: async (ctrl) => {
      if (chunks.length) ctrl.enqueue(chunks);
      id !== null && clearInterval(id);
    },
  });
}
