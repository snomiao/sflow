import type { Ord } from "rambda";
import type { Awaitable } from "./Awaitable";
import { nils } from "./nils";
import { pMaps } from "./pMaps";

export const distributeBys = <T>(
  groupFn: (x: T) => Awaitable<Ord>,
): TransformStream<T, ReadableStream<T>> => {
  const streams = new Map<
    Ord,
    TransformStream<T, T> & { writer: WritableStreamDefaultWriter<T> }
  >();
  const { writable: srcs, readable } = new TransformStream<
    ReadableStream<T>,
    ReadableStream<T>
  >();
  const { writable, readable: chunks } = new TransformStream<T, T>();
  const w = srcs.getWriter();
  chunks
    .pipeThrough(
      pMaps<T, void>(async (chunk) => {
        const ord = await groupFn(chunk);
        // create stream
        if (!streams.has(ord))
          await (async () => {
            const t = new TransformStream();
            await w.write(t.readable);
            const r = { ...t, writer: t.writable.getWriter() };
            streams.set(ord, r);
            return r;
          })();
        const t = streams.get(ord);
        if (!t) throw new Error(`Stream not found for order ${ord}`);
        await t.writer.write(chunk);
      }),
    )
    .pipeTo(nils())
    .finally(() => {
      w.close();
      [...streams.values()].map((e) => e.writer.close());
    });
  return { writable, readable };
};
