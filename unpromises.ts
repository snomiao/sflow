/** unwrap promises of readable stream */
export function unpromises<T>(
  promise: Promise<ReadableStream<T>>
): ReadableStream<T> {
  const tr = new TransformStream<T, T>();
  (async function () {
    const s = await promise;
    await s.pipeTo(tr.writable);
  })().catch((error) => {
    console.error(error)
    tr.readable.cancel(error)
  });
  return tr.readable;
}
