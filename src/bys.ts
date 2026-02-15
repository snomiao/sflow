import type { AsyncOrSync } from "ts-essentials";
import { unpromises } from "./unpromises";

export function bys<T>(stream?: TransformStream<T, T>): TransformStream<T, T>;
export function bys<T, R>(stream: TransformStream<T, R>): TransformStream<T, R>;
export function bys<T, R>(
  fn: (s: ReadableStream<T>) => PromiseLike<ReadableStream<R>> |  ReadableStream<R>,
): TransformStream<T, R>;
export function bys(arg: unknown): ReadableWritablePair<unknown, unknown> {
  if (!arg) return new TransformStream();
  if (typeof arg !== "function")
    return bys((s) => s.pipeThrough(arg as TransformStream<unknown, unknown>));
  const fn = arg as (
    s: ReadableStream<unknown>,
  ) => AsyncOrSync<ReadableStream<unknown>>;
  const { writable, readable } = new TransformStream();
  return { writable, readable: unpromises(fn(readable)) };
}
