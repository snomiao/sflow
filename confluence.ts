import { from as wseFrom } from "web-streams-extensions";
import { wseMerges } from "./snoflow";
import { snoflow } from "./snoflow";
import { flowSource } from "./flowSource";

/** merge multiple flow sources */

export const confluence = <SRCS extends flowSource<any>[]>(...srcs: SRCS) => snoflow(wseMerges()(wseFrom(srcs.map(snoflow)))) as snoflow<
  {
    [key in keyof SRCS]: SRCS[key] extends flowSource<infer T> ? T : never;
  }[number]
>;
