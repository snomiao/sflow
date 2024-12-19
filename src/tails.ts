export function tails<T>(n = 1): TransformStream<T, T> {
  let chunks: T[] = [];
  return new TransformStream({
    transform: (chunk) => {
      chunks.push(chunk);
      if (chunks.length > n) chunks.shift();
    },
    flush: (ctrl) => {
      chunks.map((e) => ctrl.enqueue(e));
    },
  });
}
