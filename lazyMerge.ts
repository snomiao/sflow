/** pull upstream when downstream pulled */
export function lazyMergeStream(streams: ReadableStream[]) {
  const never = new Promise<never>(() => {});
  const readers = streams.map((s) => s.getReader());
  const reads = streams.map(() => null as null | Promise<never | undefined>);
  const dones: (() => void)[] = [];
  const allDone = Promise.all(
    streams.map(
      (s) =>
        new Promise<void>((resolve) => {
          dones.push(resolve);
        })
    )
  );
  return new ReadableStream({
    start: (controller) => {
      allDone.then(() => controller.close());
    },
    pull: (controller) =>
      Promise.race(
        readers.map(
          (r, i) =>
            (reads[i] ??= r.read().then(({ value, done }) => {
              if (done) {
                dones[i]();
                return never;
              }
              controller.enqueue(value);
              reads[i] = null;
            }))
        )
      ),
    cancel: (reason) => {
      readers.map((r) => r.cancel(reason));
    },
  });
}
