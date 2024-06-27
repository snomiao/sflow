import { parallels } from ".";


export const joins: {
  <T>(fn: (s: WritableStream<T>) => void | any): TransformStream<T, T>;
  <T>(stream?: ReadableStream<T>): TransformStream<T, T>;
} = (arg) => {
  if (!arg) return new TransformStream();
  if (arg instanceof ReadableStream) return joins((s) => arg.pipeTo(s));
  const fn = arg;
  const s1 = new TransformStream();
  const s2 = new TransformStream();
  // writes
  const writable = s1.writable;
  fn(s2.writable);
  // reads
  const readable = parallels(s1.readable, s2.readable);
  return { writable, readable };
};
