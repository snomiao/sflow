/**
 * Create a TransformStream that tees (forks) the stream, passing one branch to the given function or writable stream.
 * @warning Uses `ReadableStream.tee()` internally. If the forked branch is consumed slower than the main branch,
 * the tee buffer will grow unboundedly in memory (no backpressure between tee branches).
 */
export const tees: {
  <T>(fn: (s: ReadableStream<T>) => undefined | any): TransformStream<T, T>;
  <T>(stream?: WritableStream<T>): TransformStream<T, T>;
} = (arg) => {
  if (!arg) return new TransformStream();
  if (arg instanceof WritableStream) return tees((s) => s.pipeTo(arg));
  const fn = arg as (s: ReadableStream<unknown>) => unknown;
  const { writable, readable } = new TransformStream();
  const [a, b] = readable.tee();
  void fn(a);
  return { writable, readable: b };
};
