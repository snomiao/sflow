/** pipe upstream through a transform stream */
export const throughs: {
  <T>(stream?: TransformStream<T, T>): TransformStream<T, T>;
  <T, R>(stream: TransformStream<T, R>): TransformStream<T, R>;
  <T, R>(
    fn: (s: ReadableStream<T>) => ReadableStream<R>,
  ): TransformStream<T, R>;
} = (arg: unknown): ReadableWritablePair<unknown, unknown> => {
  if (!arg) return new TransformStream();
  if (typeof arg !== "function")
    return throughs((s) =>
      s.pipeThrough(arg as TransformStream<unknown, unknown>),
    );
  const fn = arg as (s: ReadableStream<unknown>) => ReadableStream<unknown>;
  const { writable, readable } = new TransformStream();
  return { writable, readable: fn(readable) };
};
