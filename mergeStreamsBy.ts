import DIE from "phpdie";
import { sortBy, type Ord } from "rambda";
import type { Awaitable } from "./Awaitable";
import { emptyStream } from "./emptyStream";
import type { FlowSource } from "./FlowSource";
import { toStream } from "./froms";
import type { sflow } from "./sflow";
type Slots<T> = Array<{ value?: T; done: boolean } | null>;
type Transformer<T> = (
  slots: Slots<T>,
  ctrl: ReadableStreamDefaultController<T>,
) => Awaitable<Slots<T>>;
type OrdFn<T> = (value: T) => Ord;
export function mergeStreamsBy<T>(
  transform: Transformer<T>,
  srcs: FlowSource<T>[],
): sflow<T>;
export function mergeStreamsBy<T>(transform: Transformer<T>): {
  (srcs: FlowSource<T>[]): sflow<T>;
};
export function mergeStreamsBy<T>(
  transform: Transformer<T>,
  sources?: FlowSource<T>[],
) {
  if (!sources)
    return ((srcs: FlowSource<T>[]) => mergeStreamsBy(transform, srcs)) as any;
  if (!sources.length) return emptyStream();
  const streams = sources.map((s) => toStream(s));
  const readers = streams.map((stream) => stream.getReader());
  let slots = streams.map(() => null) as Slots<T>;
  return new ReadableStream({
    pull: async (ctrl) => {
      // ensure fill all slots
      const results = await Promise.all(
        readers.map(async (reader, i) => (slots[i] ??= await reader.read())),
      );
      // const cands = results.filter((e) => !e.done).map((e) => e.value!);
      // if (!cands.length) ctrl.close();

      // emit slots inside transform fn, return remain slots
      slots = await transform([...slots], ctrl);
      if (slots.length !== streams.length) DIE("slot length mismatch");
    },
  });
}

export function mergeStreamsByAscend<T>(
  ordFn: OrdFn<T>,
  sources: FlowSource<T>[],
): sflow<T>;
export function mergeStreamsByAscend<T>(ordFn: OrdFn<T>): {
  (sources: FlowSource<T>[]): sflow<T>;
};
export function mergeStreamsByAscend<T>(
  ordFn: OrdFn<T>,
  sources?: FlowSource<T>[],
) {
  if (!sources)
    return ((sources: FlowSource<T>[]) =>
      mergeStreamsByAscend(ordFn, sources)) as any;
  let lastEmit: { value: T } | null = null;
  return mergeStreamsBy<T>(async (slots, ctrl) => {
    const cands = slots.filter((e) => e?.done === false).map((e) => e!.value!);
    if (!cands.length) {
      ctrl.close();
      return [];
    }
    const peak: T = sortBy(ordFn, cands)[0];
    const index: number = slots.findIndex(
      (e) => e?.done === false && e?.value === peak,
    );
    // check order correct
    if (
      lastEmit &&
      lastEmit.value !== sortBy(ordFn, [lastEmit.value, peak])[0] &&
      ordFn(lastEmit.value) !== ordFn(peak)
    )
      DIE(
        new Error(
          "MergeStreamError: one of sources is not ordered by ascending",
          {
            cause: {
              prevOrd: ordFn(lastEmit.value),
              currOrd: ordFn(peak),
              prev: lastEmit.value,
              curr: peak,
            },
          },
        ),
      );
    lastEmit = { value: peak };

    ctrl.enqueue(peak);
    return slots.toSpliced(index, 1, null);
  }, sources);
}

export function mergeStreamsByDescend<T>(
  ordFn: OrdFn<T>,
  srcs: FlowSource<T>[],
): sflow<T>;
export function mergeStreamsByDescend<T>(ordFn: OrdFn<T>): {
  (srcs: FlowSource<T>[]): sflow<T>;
};
export function mergeStreamsByDescend<T>(
  ordFn: OrdFn<T>,
  sources?: FlowSource<T>[],
) {
  if (!sources)
    return ((srcs: FlowSource<T>[]) =>
      mergeStreamsByDescend(ordFn, srcs)) as any;
  let lastEmit: { value: T } | null = null;
  return mergeStreamsBy<T>(async (slots, ctrl) => {
    const cands = slots.filter((e) => e?.done === false).map((e) => e!.value!);
    if (!cands.length) {
      ctrl.close();
      return [];
    }
    const peak: T = sortBy(ordFn, cands).toReversed()[0];
    const index: number = slots.findIndex(
      (e) => e?.done === false && e?.value === peak,
    );
    // check order correct
    if (
      lastEmit &&
      lastEmit.value !==
        sortBy(ordFn, [lastEmit.value, peak]).toReversed()[0] &&
      ordFn(lastEmit.value) !== ordFn(peak)
    )
      DIE(
        new Error(
          "MergeStreamError: one of sources is not ordered by descending",
          {
            cause: {
              prevOrd: ordFn(lastEmit.value),
              currOrd: ordFn(peak),
              prev: lastEmit.value,
              curr: peak,
            },
          },
        ),
      );
    lastEmit = { value: peak };

    ctrl.enqueue(peak);
    return slots.toSpliced(index, 1, null);
  }, sources);
}
