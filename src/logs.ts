import type { Awaitable } from "./Awaitable";
import { bys } from "./bys";
import { peeks } from "./peeks";

type MapFnIndexed<T> = (x: T, i?: number) => Awaitable<any>;
// type MapFnUnary<T> = (x: T) => Awaitable<any>;

/**
 * log the value and index and return as original stream, handy to debug.
 * Note: stream won't await the log function.
 */
export function logs<T>(mapFn: MapFnIndexed<T> = (s, _i) => s) {
  return bys(
    peeks<T>(async (e, i) => {
      const ret = mapFn(e, i);
      const val = ret instanceof Promise ? await ret : ret;
      console.log(typeof val === "string" ? val.replace(/\n$/, "") : val);
    }),
  );
}
