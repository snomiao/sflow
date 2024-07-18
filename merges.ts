import { parallels } from "./parallels";
/** return a transform stream that merges streams from args */
export const merges: {
  <T>(fn: (s: WritableStream<T>) => void): TransformStream<T, T>;
  <T>(stream?: ReadableStream<T>): TransformStream<T, T>;
  <T>(streams?: ReadableStream<T>[]): TransformStream<T, T>;
} = (...args) => {
  const arg = args[0];
  if (!arg) return new TransformStream();
  if (arg instanceof ReadableStream) return merges((s) => arg.pipeTo(s));
  const fn = arg as (s: WritableStream) => void;
  const upstream = new TransformStream();
  const s2 = new TransformStream();
  // writes
  const writable = upstream.writable;
  fn(s2.writable);
  // reads
  const readable = parallels(upstream.readable, s2.readable);
  return { writable, readable };
};
