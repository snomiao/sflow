/** pull upstream only when downstream pulled */
export function lazyMergeStream(...streams: ReadableStream[]) {
  // skip merge if only one
  if (streams.length === 1) return streams[0];
  const never = new Promise<never>(() => {});
  const readers = streams.map((s) => s.getReader());
  const reads = streams.map(() => null as null | Promise<never | undefined>);
  const dones: (() => void)[] = [];
  const allDone = Promise.all(
    streams.map(() => new Promise<void>((resolve) => void dones.push(resolve)))
  );
  return new ReadableStream(
    {
      start: (ctrl) => void allDone.then(() => ctrl.close()),
      cancel: (reason) => void readers.map((r) => r.cancel(reason)),
      pull: (ctrl) =>
        Promise.race(
          readers.map(
            (r, i) =>
              (reads[i] ??= r.read().then(({ value, done }) => {
                if (done) {
                  dones[i]();
                  return never;
                }
                ctrl.enqueue(value);
                reads[i] = null;
              }))
          )
        ),
    },
    { highWaterMark: 0 }
  );
}
