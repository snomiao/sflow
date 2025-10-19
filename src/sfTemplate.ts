import type { FlowSource } from "./FlowSource";
import { sflow } from "./sflow";

/** sflow Template */
export function sfTemplate(
  tsa: TemplateStringsArray,
  ...args: FlowSource<string>[]
): sflow<string> {
  return sflow(
    ...tsa.flatMap((str) => [sflow([str]), args.shift() || ([] as string[])]),
  );
}
// alias
export const sfT = sfTemplate;
