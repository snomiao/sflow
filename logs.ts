import type { Awaitable } from "./Awaitable";
import { peeks } from "./peeks";
import { bys } from "./throughs";

/**
 * log the value and index and return as original stream, handy to debug.
 * Note: stream won't await the log function.
 */
export function logs<T>(
  mapFn: (x: T, i: number) => Awaitable<any> = (s, i) => s
) {
  return bys(
    peeks<T>(async (e, i) => {
      const ret = mapFn(e, i);
      const val = ret instanceof Promise ? await ret : ret;
      console.log(
        typeof val === "string" ? val.replace(/\n$/,'') : val
      );
    })
  );
}
