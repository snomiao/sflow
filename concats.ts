import { concat as wseConcat } from "web-streams-extensions";
import type { FlowSource } from "./FlowSource";
import { toStream } from "./froms";
import type { SourcesType } from "./SourcesType";
/**
 * return a transform stream that concats streams from sources
 * don't get confused with mergeStream
 * concats     : returns a TransformStream, which also concats upstream
 * concatStream: returns a ReadableStream, which doesnt have upstream
 */
export const concats: {
  <T>(...streams: FlowSource<T>[]): TransformStream<T, T>;
} = (...srcs: FlowSource<any>[]) => {
  if (!srcs.length) return new TransformStream();
  const upstream = new TransformStream();
  return {
    writable: upstream.writable,
    readable: wseConcat(upstream.readable, ...srcs.map(toStream)),
  } as TransformStream;
};

/**
 * return a readable stream that concats streams from sources
 * don't get confused with concats
 * concatStream: returns a ReadableStream, which doesnt have upstream
 * concats     : returns a TransformStream, which also concats upstream
 */
export const concatStream: {
  // <T>(...streams: FlowSource<T>[]): ReadableStream<T>;
  <T, SRCS extends FlowSource<T>[]>(...streams: SRCS): ReadableStream<
    SourcesType<SRCS>
  >;
} = (...srcs: FlowSource<any>[]): ReadableStream<any> => {
  // empty stream
  if (!srcs.length) return new ReadableStream({ start: (c) => c.close() });
  // no nesscerry to merge
  if (srcs.length === 1) return toStream(srcs[0]);

  return wseConcat(...srcs.map(toStream));
};
