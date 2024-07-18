import { wseFrom } from "./wse";
import { wseMerges } from "./wseMerges";
import { snoflow } from "./sflow";
import type { FlowSource } from "./FlowSource";

/** merge multiple flow sources */

export const confluence = <SRCS extends FlowSource<any>[]>(...srcs: SRCS) =>
  snoflow(wseMerges()(wseFrom(srcs.map(snoflow)))) as snoflow<
    {
      [key in keyof SRCS]: SRCS[key] extends FlowSource<infer T> ? T : never;
    }[number]
  >;
