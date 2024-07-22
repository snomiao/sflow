import { sflow } from "./sflow";

/** @deprecated use rangeStream or rangeFlow*/
export function ranges(
  minInclusive: number,
  maxExclusive: number
): ReadableStream<number>;
export function ranges(maxExclusive: number): ReadableStream<number>;
export function ranges(...args: number[]) {
  const [min, max]: [number, number] =
    args[1] != null ? [args[0], args[1]] : [0, args[0]];
  let i = min;
  return new ReadableStream({
    pull: (ctrl) => {
      ctrl.enqueue(i);
      if (++i >= max) ctrl.close();
    },
  });
}

export function rangeStream(
  minInclusive: number,
  maxExclusive: number
): ReadableStream<number>;
export function rangeStream(maxExclusive: number): ReadableStream<number>;
export function rangeStream(...args: number[]) {
  const [min, max]: [number, number] =
    args[1] != null ? [args[0], args[1]] : [0, args[0]];
  let i = min;
  return new ReadableStream({
    pull: (ctrl) => {
      ctrl.enqueue(i);
      if (++i >= max) ctrl.close();
    },
  });
}
export function rangeFlow(
  minInclusive: number,
  maxExclusive: number
): ReadableStream<number>;
export function rangeFlow(maxExclusive: number): ReadableStream<number>;
export function rangeFlow(...args: number[]) {
  // @ts-ignore
  return sflow(rangeStream(...args));
}
