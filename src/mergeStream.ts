import type { FlowSource } from "./FlowSource";
import { toStream } from "./froms";
import type { SourcesType } from "./SourcesType";
import { streamAsyncIterator } from "./streamAsyncIterator";

/**
 * return a readable stream that merges streams from sources
 * don't get confused with merges
 * mergeStream: returns a ReadableStream, which doesnt have upstream
 * merges     : returns a TransformStream, which also merges upstream
 */

export const mergeStream: {
  // <T>(...streams: FlowSource<T>[]): ReadableStream<T>;
  <T, SRCS extends FlowSource<T>[]>(
    ...streams: SRCS
  ): ReadableStream<SourcesType<SRCS>>;
} = (...srcs: FlowSource<any>[]): ReadableStream<any> => {
  if (!srcs.length) return new ReadableStream({ start: (c) => c.close() });
  // no nesscerry to merge
  if (srcs.length === 1) return toStream(srcs[0]!);

  const t = new TransformStream();
  const w = t.writable.getWriter();
  const streams = srcs.map(toStream);
  Promise.all(
    streams.map(async (s) => {
      for await (const chunk of Object.assign(s, {
        [Symbol.asyncIterator]: streamAsyncIterator,
      }))
        await w.write(chunk);
    }),
  )
    .then(async () => w.close())
    .catch((error) => {
      console.error(error);
      return Promise.all([
        t.writable.abort(error),
        ...streams.map((e) => e.cancel(error)),
      ]);
    });

  return t.readable;
  // return parallels(...srcs.map(toStream));
  // return parallels(...srcs.map(toStream));
};
