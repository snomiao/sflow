import { pMaps, type FlowSource } from ".";
import { maps } from "./maps";
import { nils } from "./nils";
import { froms } from "./sflow";

/** Confluence of multiple flow sources */

export const confluences = <T>(): TransformStream<FlowSource<T>, T> => {
  const { writable, readable: sources } = new TransformStream<
    FlowSource<T>,
    FlowSource<T>
  >();
  const { writable: chunks, readable } = new TransformStream<T, T>();
  const w = chunks.getWriter();

  sources
    .pipeThrough(
      pMaps((src) =>
        froms(src)
          .pipeThrough(maps((c) => w.write(c)))
          .pipeTo(nils())
      )
    )
    .pipeTo(nils())
    .finally(() => w.close());
  return { writable, readable };
};
