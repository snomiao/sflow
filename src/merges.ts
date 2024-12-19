import type { FlowSource } from "./FlowSource";
import { toStream } from "./froms";
import { parallels } from "./parallels";
/**
 * return a transform stream that merges streams from sources
 * don't get confused with mergeStreamw
 * merges     : returns a TransformStream, which also merges upstream
 * mergeStream: returns a ReadableStream, which doesnt have upstream
 */
export const merges: {
  <T>(...streams: FlowSource<T>[]): TransformStream<T, T>;
} = (...srcs: FlowSource<any>[]) => {
  if (!srcs.length) return new TransformStream();
  const upstream = new TransformStream();
  return {
    writable: upstream.writable,
    readable: parallels(upstream.readable, ...srcs.map(toStream)),
  } as TransformStream;
};

