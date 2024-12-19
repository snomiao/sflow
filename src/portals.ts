import { throughs } from "./throughs";

/** pipe upstream through a PortalStream, aka. TransformStream<T, T> */
export const portals: {
  <T>(stream?: TransformStream<T, T>): TransformStream<T, T>;
  <T>(
    fn: (s: ReadableStream<T>) => ReadableStream<T>
  ): TransformStream<T, T>;
} = (arg: any) => {
  if (!arg) return new TransformStream();
  if (typeof arg !== "function") return throughs((s) => s.pipeThrough(arg));
  const fn = arg;
  const { writable, readable } = new TransformStream();
  return { writable, readable: fn(readable) };
};
