import { chunkIfs } from "./chunkIfs";
import { flatMaps } from "./flatMaps";
import { maps } from "./maps";
import { throughs } from "./throughs";
/** split string stream into lines stream, handy to concat LLM's tokens stream into line by line stream or split a long string by lines */
export const lines: {
  (): TransformStream<string, string>;
} = () => {
  return throughs<string, string>((r) =>
    r
      .pipeThrough(flatMaps((s: string) => s.split(/(?<=\n)/g)))
      .pipeThrough(chunkIfs((ch: string) => ch.indexOf("\n") === -1, {inclusive: true}))
      .pipeThrough(maps((chunks) => chunks.join("").replace(/\r?\n$/, "")))
  );
};
