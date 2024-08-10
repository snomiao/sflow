import DIE from "phpdie";
import type { Awaitable } from "./Awaitable";
import { peeks } from "./peeks";
import { bys } from "./throughs";

type MapFnIndexed<T> = (x: T, i: number) => Awaitable<any>;
type MapFnUnary<T> = (x: T) => Awaitable<any>;

/**
 * log the value and index and return as original stream, handy to debug.
 * Note: stream won't await the log function.
 */
export function logs<T>(mapFn: MapFnIndexed<T> | MapFnUnary<T> = (s, i) => s) {
  return bys(
    peeks<T>(async (e, i) => {
      const ret =
        mapFn.length === 1
          ? (mapFn as MapFnUnary<T>)(e)
          : mapFn.length === 2
          ? (mapFn as MapFnIndexed<T>)(e, 2)
          : DIE("too much args");
      const val = ret instanceof Promise ? await ret : ret;
      console.log(typeof val === "string" ? val.replace(/\n$/, "") : val);
    })
  );
}
logs(JSON.stringify);
