/**
 * Drop chunks by interval, will ensure last item emit by default.
 * pass false to drop last
 * @example
 * if you dont want item drops, please use forEach to limit speed
 * sth like:
 * sflow().forEach(sleep(1000)).forEach(sleep(1000)).log().done()
 */
export function throttles<T>(interval: number, { keepLast = true } = {}) {
  let id: number | null | Timer = null;
  let lasts: T[] = [];
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      if (id) {
        if (keepLast) lasts = [chunk];
        return; // drop current chunk an continue streaming
      }
      lasts = [];
      ctrl.enqueue(chunk);
      id = setTimeout(() => {
        id = null;
        // lasts.map((e) => ctrl.enqueue(e));
      }, interval);
    },
    flush: async (ctrl) => {
      // wait for last item enqueue, and then allow stream termination
      while (id) {
        await new Promise((r) => setTimeout(r, interval / 2));
      }
      console.log({ lasts });
      lasts.map((e) => ctrl.enqueue(e));
    },
  });
}
