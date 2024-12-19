import { wseFrom } from "./wse";
import { wseMerges } from "./wseMerges";

export const parallels = <SRCS extends ReadableStream<any>[]>(...srcs: SRCS) =>
  wseMerges()(wseFrom(srcs)) as ReadableStream<
    {
      [key in keyof SRCS]: SRCS[key] extends ReadableStream<infer T>
        ? T
        : never;
    }[number]
  >;
