import { type ReadableLike } from "web-streams-extensions";

export type FlowSource<T> =
  | Promise<T>
  | Iterable<T>
  | AsyncIterable<T>
  | (() => Iterable<T> | AsyncIterable<T>)
  | ReadableLike<T>
  | ReadableStream<T>
  | snoflow<T>;
// | (T extends Uint8Array ? XMLHttpRequestBodyInit : never);
