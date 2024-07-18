import type { Awaitable } from "./Awaitable";
import { peeks } from "./peeks";
import { throughs } from "./throughs";

/**
 * log the value and index and return as original stream, handy to debug.
 * Note: stream won't await the log function.
 */
export function logs<T>(
  mapFn: (x: T, i: number) => Awaitable<any> = (s, i) => s
) {
  return throughs(peeks<T>(async (e, i) => console.log(await mapFn(e, i))));
}
