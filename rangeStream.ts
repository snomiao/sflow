import { sflow } from "./sflow";

export function rangeStream(
  minInclusive: number,
  maxExclusive: number
): ReadableStream<number>;
export function rangeStream(maxExclusive: number): ReadableStream<number>;
export function rangeStream(...args: number[]) {
  const [min, max]: [number, number] =
    args[1] != null ? [args[0], args[1]] : [0, args[0]];
  let i = min;
  return new ReadableStream(
    {
      pull: (ctrl) => {
        ctrl.enqueue(i);
        if (++i >= max) ctrl.close();
      },
    },
    { highWaterMark: 0 } //lazy
  );
}

export function rangeFlow(
  minInclusive: number,
  maxExclusive: number
): sflow<number>;
export function rangeFlow(maxExclusive: number): sflow<number>;
export function rangeFlow(...args: number[]) {
  // @ts-ignore
  return sflow(rangeStream(...args));
}
