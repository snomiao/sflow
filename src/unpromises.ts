import type { AsyncOrSync } from "ts-essentials";

/** unwrap promises of readable stream */
export function unpromises<T>(
  promise: AsyncOrSync<ReadableStream<T>>,
): ReadableStream<T> {
  const tr = new TransformStream<T, T>();
  (async () => {
    const s = await promise;
    await s.pipeTo(tr.writable);
  })().catch((error) => tr.writable.abort(error).catch(() => {}));
  return tr.readable;
}

/** unwrap promises of readable stream */
export function unpromisesFn<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<ReadableStream<T>>,
): (...args: Args) => ReadableStream<T> {
  return (...args: Args) => unpromises(fn(...args));
}
