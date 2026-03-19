import { wseMerge } from "./wse";

export const wseMerges: (
  concurrent?: number,
) => <T>(
  src: ReadableStream<ReadableStream<T> | Promise<T> | Iterable<T> | AsyncIterable<T>>,
) => ReadableStream<T> = wseMerge as never;
