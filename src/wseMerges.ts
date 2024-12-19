import { wseMerge } from "./wse";

export const wseMerges: (
  concurrent?: number,
) => <T>(
  src: ReadableStream<ReadableStream<T> | Promise<T>>,
) => ReadableStream<T> = wseMerge as any;
