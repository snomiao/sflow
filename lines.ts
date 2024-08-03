import { chunkIfs } from "./chunkIfs";
import { flatMaps } from "./flatMaps";
import { maps } from "./maps";
import { throughs } from "./throughs";
type LinesOptions = { EOL?: "KEEP" | "LF" | "CRLF" | "NONE" };
/** split string stream into lines stream, handy to concat LLM's tokens stream into line by line stream or split a long string by lines */
export const lines: {
  (opts?: LinesOptions): TransformStream<string, string>;
} = ({ EOL = "KEEP" }: LinesOptions = {}) => {
  const CRLFMap = {
    KEEP: "$1",
    LF: "\n",
    CRLF: "\r\n",
    NONE: "",
  };
  return throughs<string, string>((r) =>
    r
      .pipeThrough(flatMaps((s: string) => s.split(/(?<=\n)/g)))
      .pipeThrough(
        chunkIfs((ch: string) => ch.indexOf("\n") === -1, { inclusive: true })
      )
      .pipeThrough(
        maps((chunks) => chunks.join("").replace(/(\r?\n?)$/, CRLFMap[EOL]))
      )
  );
};
