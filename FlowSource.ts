import { type ReadableLike } from "web-streams-extensions";
import type sflow from ".";

export type FlowSource<T> =
  | Promise<T>
  | Iterable<T>
  | AsyncIterable<T>
  | (() => Iterable<T> | AsyncIterable<T>)
  | ReadableLike<T>
  | ReadableStream<T>
  | sflow<T>;
// | (T extends Uint8Array ? XMLHttpRequestBodyInit : never);
