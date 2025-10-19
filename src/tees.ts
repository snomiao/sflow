export const tees: {
  <T>(fn: (s: ReadableStream<T>) => undefined | any): TransformStream<T, T>;
  <T>(stream?: WritableStream<T>): TransformStream<T, T>;
} = (arg) => {
  if (!arg) return new TransformStream();
  if (arg instanceof WritableStream) return tees((s) => s.pipeTo(arg));
  const fn = arg;
  const { writable, readable } = new TransformStream();
  const [a, b] = readable.tee();
  // @ts-expect-error
  fn(a);
  return { writable, readable: b };
};
