import type { FlowSource } from "./FlowSource";
import { toStream } from "./froms";
import { parallels } from "./parallels";
import { streamAsyncIterator } from "./streamAsyncIterator";
type SourcesType<SRCS extends FlowSource<any>[]> = SRCS extends FlowSource<
  infer T
>[]
  ? T
  : never;

/**
 * return a transform stream that merges streams from sources
 * dont get confused with mergeStream
 * merges     : returns a TransformStream, which also merges upstream
 * mergeStream: returns a ReadableStream, which doesnt have upstream
 */
export const merges: {
  <T>(...streams: FlowSource<T>[]): TransformStream<T, T>;
  <SRCS extends FlowSource<any>[]>(...streams: SRCS): TransformStream<
    SourcesType<SRCS>,
    SourcesType<SRCS>
  >;
} = (...srcs: FlowSource<any>[]) => {
  if (!srcs.length) return new TransformStream();
  const upstream = new TransformStream();
  return {
    writable: upstream.writable,
    readable: parallels(upstream.readable, ...srcs.map(toStream)),
  } as TransformStream;
};

/**
 * return a readable stream that merges streams from sources
 * merges     : returns a TransformStream, which also merges upstream
 * mergeStream: returns a ReadableStream, which doesnt have upstream
 */
export const mergeStream: {
  <T>(...streams: FlowSource<T>[]): ReadableStream<T>;
  <SRCS extends FlowSource<any>[]>(...streams: SRCS): ReadableStream<
    SourcesType<SRCS>
  >;
} = (...srcs: FlowSource<any>[]): ReadableStream<any> => {
  if (!srcs.length) return new ReadableStream({ start: (c) => c.close() });
  const t = new TransformStream();
  const w = t.writable.getWriter();
  const streams = srcs.map(toStream);
  Promise.all(
    streams.map(async (s) => {
      for await (const chunk of Object.assign(s, {
        [Symbol.asyncIterator]: streamAsyncIterator,
      }))
        await w.write(chunk);
    })
  )
    .then(async () => w.close())
    .catch(error => {console.error(error)
    return Promise.all([
      t.writable.abort(error),
      ...streams.map((e) => e.cancel(error)),
    ]);
  }
    );

  return t.readable;
  // return parallels(...srcs.map(toStream));
  // return parallels(...srcs.map(toStream));
};
