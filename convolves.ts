// implement this function in typescript, 使用最精简的写法, dont write comments
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
