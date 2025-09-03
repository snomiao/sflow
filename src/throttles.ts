type ThrottleOption = {
  /** drop=true: Drop chunks by interval, will ensure last item emit by default. set keepLast=false to drop last */
  drop?: boolean;
  /**
   * drop=true: Drop chunks by interval, will ensure last item emit by default. set keepLast=false to drop last
   * has no effect when drop=false
   */
  keepLast?: boolean;
};
/**
 * ```ts
 * drop=true: Drop chunks by interval, will ensure last item emit by default.
 * set keepLast=false to drop last
 *
 * @example
 * if you dont want item drops, please use forEach to limit speed
 * sth like:
 * sflow().forEach(sleep(1000)).forEach(sleep(1000)).log().done()
 */
export function throttles<T>(
  interval: number,
  { drop = false, keepLast = true }: ThrottleOption = {},
) {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let cdPromise = Promise.withResolvers();
  let lasts: T[] = [];
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      if (timerId) {
        if (keepLast) lasts = [chunk];
        if (drop) return; // drop current chunk an continue streaming.
        await cdPromise.promise;
      }
      lasts = [];
      ctrl.enqueue(chunk);
      //
      [cdPromise, timerId] = [
        Promise.withResolvers(),
        setTimeout(() => {
          timerId = null;
          cdPromise.resolve();
          // lasts.map((e) => ctrl.enqueue(e));
        }, interval),
      ] as const;
    },
    flush: async (ctrl) => {
      // wait for last item enqueue, and then allow stream termination
      while (timerId) await new Promise((r) => setTimeout(r, interval / 2));
      lasts.map((e) => ctrl.enqueue(e));
    },
  });
}
