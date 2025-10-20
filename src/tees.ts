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
