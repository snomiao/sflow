import { throughs } from "./throughs";

/* terminate the stream when signal is aborted. */
export function terminates<_T>(signal: AbortSignal) {
  return throughs((r) => r.pipeThrough(new TransformStream(), { signal }));
}
/** @deprecated use terminates */
export function aborts(signal: AbortSignal) {
  return throughs((r) => r.pipeThrough(new TransformStream(), { signal }));
}
