/** when downstream pulls,
 * try read upstream, cache the item and enqueue item 1 time
 * when downstream pull n times, then repeat emit n times that item
 *
 */
export function repeats<T>(n = Infinity): TransformStream<T, T> {
  const chunks: T[] = [];
  let remain = n;
  const t = new TransformStream(
    undefined,
    { highWaterMark: 1 },
    { highWaterMark: 0 }
  );
  const rd = t.readable.getReader();
  return {
    writable: t.writable,
    readable: new ReadableStream<T>(
      {
        cancel: (r) => rd.cancel(r),
        async pull(ctrl) {
          if (!remain) chunks.splice(0, 1); // clear chunks if no remain count

          if (!chunks.length) {
            const { value, done } = await rd.read();
            if (done) return ctrl.close();

            chunks.push(value);
            remain = n;
          }

          ctrl.enqueue(chunks[0] as T);
          remain -= 1;
          return;
        },
      },
      { highWaterMark: 0 }
    ),
  };
}
