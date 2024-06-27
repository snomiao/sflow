import DIE from "@snomiao/die";
import type { Awaitable } from "./Awaitable";

/* map a stream by parallel, return them in original order */

export const pMaps: {
  <T, R>(
    concurrent: number,
    fn: (x: T, i: number) => Awaitable<R>
  ): TransformStream<T, R>;
  <T, R>(fn: (x: T, i: number) => Awaitable<R>): TransformStream<T, R>;
} = <T, R>(
  arg1: number | ((x: T, i: number) => Awaitable<R>),
  arg2?: (x: T, i: number) => Awaitable<R>
) => {
    const concurrent = typeof arg1 === "number" ? arg1 : Infinity;
    const fn = typeof arg2 === "function"
      ? arg2
      : typeof arg1 === "function"
        ? arg1
        : DIE("NEVER");
    let i = 0;
    let promises: Awaitable<R>[] = [];
    return new TransformStream<T, R>({
      transform: async (chunk, ctrl) => {
        promises.push(fn(chunk, i++));
        if (promises.length >= concurrent) ctrl.enqueue(await promises.shift());
      },
      flush: async (ctrl) => {
        while (promises.length) ctrl.enqueue(await promises.shift());
      },
    });
  };
