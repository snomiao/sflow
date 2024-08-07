import { type ReadableLike } from "web-streams-extensions";
import type sflow from "./index";

export type FlowSource<T> =
  | Promise<T>
  | Iterable<T>
  | AsyncIterable<T>
  | (() => Iterable<T>)
  | (() => AsyncIterable<T>)
  | ReadableLike<T>
  | ReadableStream<T>
  // | ((w: WritableStream<T>) => void)
  | sflow<T>;
// | (T extends Uint8Array ? XMLHttpRequestBodyInit : never);
