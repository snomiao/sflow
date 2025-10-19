import type { FlowSource } from "./FlowSource";

export type SourcesType<SRCS extends FlowSource<unknown>[]> =
  SRCS extends FlowSource<infer T>[] ? T : never;
