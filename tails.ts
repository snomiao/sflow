export function tails<T>(n = 1) {
  let chunks: T[] = [];
  return new TransformStream<T, T>({
    transform: (chunk) => {
      chunks.push(chunk);
      if (chunks.length > n) chunks.shift();
    },
    flush: (ctrl) => {
      chunks.map((e) => ctrl.enqueue(e));
    },
  });
}
