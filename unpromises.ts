/** unwrap promises of readable stream */
export function unpromises<T>(
  promise: Promise<ReadableStream<T>>
): ReadableStream<T> {
  const tr = new TransformStream<T, T>();
  (async function () {
    const s = await promise;
    await s.pipeTo(tr.writable);
  })().catch((error) => {
    tr.readable.cancel(error).catch(() => {
      throw error;
    });
  });
  return tr.readable;
}

/** unwrap promises of readable stream */
export function unpromisesFn<Args extends any[], T>(
  fn: (...args: Args) => Promise<ReadableStream<T>>
): (...args: Args) => ReadableStream<T> {
  return (...args: Args) => unpromises(fn(...args));
}
