/** Currently will not pipe down more items after count satisfied, but still receives more items. */
export function limits<T>(n = 1, { terminate = false } = {}) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      (n-- > 0 && ctrl.enqueue(chunk)) || (terminate && ctrl.terminate());
    },
  });
}
