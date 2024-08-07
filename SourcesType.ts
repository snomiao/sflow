import type { FlowSource } from "./FlowSource";

export type SourcesType<SRCS extends FlowSource<any>[]> = SRCS extends FlowSource<
  infer T
>[] ? T : never;
