import type { FlowSource } from "./FlowSource";
import { toStream } from "./froms";
import { maps } from './maps';
import { nils } from './nils';
import type { SourcesType } from "./SourcesType";
/**
 * return a transform stream that concats streams from sources
 * don't get confused with mergeStream
 * concats     : returns a TransformStream, which also concats upstream
 * concatStream: returns a ReadableStream, which doesnt have upstream
 */
export const concats: {
  <T>(streams?: FlowSource<FlowSource<T>>): TransformStream<T, T>;
} = (srcs?: FlowSource<FlowSource<any>>) => {
  if (!srcs) return new TransformStream();
  const upstream = new TransformStream();
  return {
    writable: upstream.writable,
    readable: concatStream([upstream.readable, concatStream(srcs)]),
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
  <T, SRCS extends FlowSource<FlowSource<T>>>(
    srcs?: FlowSource<FlowSource<T>>
  ): ReadableStream<SourcesType<SRCS>>;
} = <T>(srcs?: FlowSource<FlowSource<T>>): ReadableStream<T> => {
  if (!srcs) return new ReadableStream<T>({ start: (c) => c.close() });
  const t = new TransformStream<T, T>();
  const w = t.writable.getWriter();
  toStream(srcs)
    .pipeThrough(maps(toStream))
    .pipeThrough(
      maps(async (s) => {
        const r = s.getReader();
        while (true) {
          const { value, done } = await r.read();
          if (done) break;
          await w.write(value);
        }
      })
    )
    .pipeTo(nils())
    .then(()=>w.close())
    .catch((reason)=>w.abort(reason))

  // return wseConcat(...streams);
  return t.readable;
};
