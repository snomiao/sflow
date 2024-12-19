/**
 * @example
 * convolves(2)
 * [1,2,3,4] => [[1,2],[2,3],[3,4]]
 * convolves(3)
 * [1,2,3,4] => [[1,2,3],[2,3,4]]
 */
export function convolves<T>(n: number): TransformStream<T, T[]> {
  const buffer: T[] = [];
  return new TransformStream({
    transform(chunk, controller) {
      buffer.push(chunk);
      if (buffer.length > n) buffer.shift();
      if (buffer.length === n) controller.enqueue([...buffer]);
    },
    flush(controller) {
      while (buffer.length > 1) {
        buffer.shift();
        if (buffer.length === n) controller.enqueue([...buffer]);
      }
    },
  });
}
