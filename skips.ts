export function skips<T>(n = 1) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      if (n <= 0) ctrl.enqueue(chunk);
      else n--;
    },
  });
}
