
export function heads<T>(n = 1) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      return void (n-- > 0 && ctrl.enqueue(chunk));
    },
  });
}
