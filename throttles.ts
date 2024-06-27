
export function throttles<T>(t: number, keepLast = true) {
  let id: number | null | Timer = null;
  let lasts: T[] = [];
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      if (id) {
        if (keepLast) lasts = [chunk];
        return;
      }
      lasts = [];
      ctrl.enqueue(chunk);
      id = setTimeout(() => {
        id = null;
        lasts.map((e) => ctrl.enqueue(e));
      }, t);
    },
    flush: async () => {
      // wait for last item enqueue, and then allow stream termination
      while (id) await new Promise((r) => setTimeout(r, t / 2));
    },
  });
}
