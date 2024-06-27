/** you could use flats to re-join buffers, default buffer length is Infinity, which will enqueue when upstream drain */
export function buffers<T>(n: number = Infinity) {
  let chunks: T[] = [];
  if (n <= 0) throw new Error("Buffer size must be greater than 0");
  return new TransformStream<T, T[]>({
    transform: async (chunk, ctrl) => {
      chunks.push(chunk);
      if (chunks.length >= n) ctrl.enqueue(chunks.splice(0, Infinity)); // clear chunks
    },
    flush: async (ctrl) => void (chunks.length && ctrl.enqueue(chunks)),
  });
}
