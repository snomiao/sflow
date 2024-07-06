import { from as wseFrom, merge as wseMerge } from "web-streams-extensions";
import { snoflow, wseMerges } from "./snoflow";
export type { Unwinded as Unwinded } from "./Unwinded";
export { aborts } from "./aborts";
export { chunks as buffers } from "./chunks";
export { debounces } from "./debounces";
export { filters } from "./filters";
export { flatMaps } from "./flatMaps";
export { flats } from "./flats";
export type { flowSource } from "./flowSource";
export { chunkIntervals as intervals } from "./chunkIntervals";
export { joins } from "./joins";
export { mapAddFields } from "./mapAddFields";
export { maps } from "./maps";
export { mergeAscends, mergeDescends } from "./mergeAscends";
export { nils } from "./nils";
export { pMaps } from "./pMaps";
export { peeks } from "./peeks";
export { reduces } from "./reduces";
export { skips } from "./skips";
export { slices } from "./slices";
export { streamAsyncIterator } from "./streamAsyncIterator";
export { tails } from "./tails";
export { tees } from "./tees";
export { throttles } from "./throttles";
export { throughs } from "./throughs";
export { unwinds } from "./unwinds";

/** @deprecated will remove next major version */
export const merges: (
  concurrent?: number
) => <T>(
  src: ReadableStream<ReadableStream<T> | Promise<T>>
) => ReadableStream<T> = wseMerge as any;

export const firsts = limits;
export function heads<T>(n = 1) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      return void (n-- > 0 && ctrl.enqueue(chunk));
    },
  });
}
/** Currently will not pipe down more items after count satisfied, but still receives more items. */
export function limits<T>(n: number, { terminate = false } = {}) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      if (n-- > 0) {
        ctrl.enqueue(chunk);
      } else {
        terminate && ctrl.terminate();
      }
    },
  });
}

export const parallels = <SRCS extends ReadableStream<any>[]>(...srcs: SRCS) =>
  wseMerges()(wseFrom(srcs)) as ReadableStream<
    {
      [key in keyof SRCS]: SRCS[key] extends ReadableStream<infer T>
        ? T
        : never;
    }[number]
  >;
export { snoflow };
export default snoflow;
