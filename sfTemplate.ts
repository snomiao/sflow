import type { FlowSource } from "./FlowSource";
import { sf, sflow } from "./sflow";
/** sflow Template */
export function sfTemplate(
  tsa: TemplateStringsArray,
  ...args: FlowSource<string>[]
): sflow<string> {
  return sf(
    ...tsa.map((str) => [sf([str]), args.shift() || ([] as string[])]).flat()
  );
}
// alias
export const sfT = sfTemplate;
