import type { FlowSource } from "./FlowSource";
import { sflow } from "./sflow";
import { sf } from ".";

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
