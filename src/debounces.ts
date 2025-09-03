export function debounces<T>(t: number) {
  let id: ReturnType<typeof setTimeout> | null = null;
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      if (id) clearTimeout(id);
      id = setTimeout(() => {
        ctrl.enqueue(chunk);
        id = null;
      }, t);
    },
    flush: async () => {
      while (id) await new Promise((r) => setTimeout(r, t / 2));
    },
  });
}
