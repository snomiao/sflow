import type { FlowSource } from ".";
import { wseFrom } from "./wse";

export const toStream: {
  <T>(src: FlowSource<T>): ReadableStream<T>;
} = (src) => (src instanceof ReadableStream ? src : wseFrom(src));
