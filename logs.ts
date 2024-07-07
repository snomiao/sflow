import { peeks } from "./peeks";
import { throughs } from "./throughs";

/**
 * log the value and index and return as original stream, handy to debug.
 * Note: stream won't await the log function.
 */
export function logs<T>(logFn: (x: T, i: number) => void = console.log) {
  return throughs(peeks<T>(logFn));
}
