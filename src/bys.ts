import type { AsyncOrSync } from "ts-essentials";
import { unpromises } from "./unpromises";

export function bys<T>(stream?: TransformStream<T, T>): TransformStream<T, T>;
export function bys<T, R>(stream: TransformStream<T, R>): TransformStream<T, R>;
export function bys<T, R>(
  fn: (s: ReadableStream<T>) => AsyncOrSync<ReadableStream<R>>,
): TransformStream<T, R>;
export function bys(arg: unknown) {
  if (!arg) return new TransformStream();
  if (typeof arg !== "function") return bys((s) => s.pipeThrough(arg));
  const fn = arg;
  const { writable, readable } = new TransformStream();
  return { writable, readable: unpromises(fn(readable)) };
}
