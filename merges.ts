

import { wseMerge } from "./wse";

/** @deprecated will remove next major version, use confluence instead */
export const merges: (
  concurrent?: number
) => <T>(
  src: ReadableStream<ReadableStream<T> | Promise<T>>
) => ReadableStream<T> = wseMerge as any;
