import { type ReadableLike } from "web-streams-extensions";
import { snoflow } from ".";


export type flowSource<T> = Promise<T> |
  Iterable<T> |
  AsyncIterable<T> |
  (() => Iterable<T> | AsyncIterable<T>) |
  ReadableLike<T> |
  ReadableStream<T> |
  snoflow<T>;
