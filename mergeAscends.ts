import DIE from "phpdie";
import { sortBy, type Ord } from "rambda";
import { sflow, type FlowSource } from ".";
interface MergeBy {
  <T>(ordFn: (input: T) => Ord, srcs: FlowSource<FlowSource<T>>): sflow<T>;
  <T>(ordFn: (input: T) => Ord): {
    (srcs: FlowSource<FlowSource<T>>): sflow<T>;
  };
}

/**
 * merge multiple stream by ascend order, assume all input stream is sorted by ascend
 * output stream will be sorted by ascend too.
 *
 * if one of input stream is not sorted by ascend, it will throw an error.
 *
 * @param ordFn a function to get the order of input
 * @param srcs a list of input stream
 * @returns a new stream that merge all input stream by ascend order
 */
export const mergeAscends: MergeBy = <T>(ordFn: (input: T) => Ord, _srcs?: FlowSource<FlowSource<T>>) => {
  if (!_srcs) return ((srcs: any) => mergeAscends(ordFn, srcs)) as any;
  return sflow(new ReadableStream<T>({
    pull: async (ctrl) => {
      const srcs = await sflow(_srcs).toArray();
      const slots = srcs.map(() => undefined as { value: T } | undefined);
      const pendingSlotRemoval = srcs.map(
        () => undefined as PromiseWithResolvers<void> | undefined
      );
      const drains = srcs.map(() => false);
      let lastMinValue: T | undefined = undefined;
      await Promise.all(
        srcs.map(async (src, i) => {
          for await (const value of sflow(src)) {
            while (slots[i] !== undefined) {
              if (shiftMinValueIfFull()) continue;
              pendingSlotRemoval[i] = Promise.withResolvers<void>();
              await pendingSlotRemoval[i]!.promise; // wait for this slot empty;
            }
            slots[i] = { value };
            shiftMinValueIfFull();
          }
          // done
          drains[i] = true;
          pendingSlotRemoval.map((e) => e?.resolve());
          await Promise.all(pendingSlotRemoval.map((e) => e?.promise));
          const allDrain = drains.every(Boolean);

          if (allDrain) {
            while (slots.some((e) => e !== undefined)) shiftMinValueIfFull();
            ctrl.close();
          }

          function shiftMinValueIfFull() {
            const isFull = slots.every(
              (slot, i) => slot !== undefined || drains[i]
            );
            if (!isFull) return false;
            const fullSlots = slots
              .flatMap((e) => (e !== undefined ? [e] : []))
              .map((e) => e.value);
            const minValue = sortBy(ordFn, fullSlots)[0];
            const minIndex = slots.findIndex((e) => e?.value === minValue);
            if (lastMinValue !== undefined) {
              const ordered = sortBy(ordFn, [lastMinValue, minValue]);
              (ordered[0] === lastMinValue && ordered[1] === minValue) ||
                DIE(`
mergeAscends Error: one of source stream is not ascending ordered.

prev: ${JSON.stringify(lastMinValue)}

curr: ${JSON.stringify(minValue)}
`);
            }
            lastMinValue = minValue;
            ctrl.enqueue(minValue);
            slots[minIndex] = undefined;
            pendingSlotRemoval[minIndex]?.resolve();
            pendingSlotRemoval[minIndex] = undefined;
            return true;
          }
        })
      );
    },
  }));
};


/**
 * merge multiple stream by ascend order, assume all input stream is sorted by ascend
 * output stream will be sorted by ascend too.
 *
 * if one of input stream is not sorted by ascend, it will throw an error.
 *
 * @param ordFn a function to get the order of input
 * @param srcs a list of input stream
 * @returns a new stream that merge all input stream by ascend order
 */
export const mergeDescends: MergeBy = <T>(ordFn: (input: T) => Ord, _srcs?: FlowSource<FlowSource<T>>) => {
  if (!_srcs) return ((srcs: any) => mergeDescends(ordFn, srcs)) as any;
  return sflow(new ReadableStream<T>({
    pull: async (ctrl) => {
      const srcs = await sflow(_srcs).toArray();
      const slots = srcs.map(() => undefined as { value: T } | undefined);
      const pendingSlotRemoval = srcs.map(
        () => undefined as PromiseWithResolvers<void> | undefined
      );
      const drains = srcs.map(() => false);
      let lastMaxValue: T | undefined = undefined;
      await Promise.all(
        srcs.map(async (src, i) => {
          for await (const value of sflow(src)) {
            while (slots[i] !== undefined) {
              if (shiftMaxValueIfFull()) continue;
              pendingSlotRemoval[i] = Promise.withResolvers<void>();
              await pendingSlotRemoval[i]!.promise; // wait for this slot empty;
            }
            slots[i] = { value };
            shiftMaxValueIfFull();
          }
          // done
          drains[i] = true;
          pendingSlotRemoval.map((e) => e?.resolve());
          await Promise.all(pendingSlotRemoval.map((e) => e?.promise));
          const allDrain = drains.every(Boolean);

          if (allDrain) {
            while (slots.some((e) => e !== undefined)) shiftMaxValueIfFull();
            ctrl.close();
          }

          function shiftMaxValueIfFull() {
            const isFull = slots.every(
              (slot, i) => slot !== undefined || drains[i]
            );
            if (!isFull) return false;
            const fullSlots = slots
              .flatMap((e) => (e !== undefined ? [e] : []))
              .map((e) => e.value);
            const maxValue = sortBy(ordFn, fullSlots).toReversed()[0];
            const maxIndex = slots.findIndex((e) => e?.value === maxValue);
            if (lastMaxValue !== undefined) {
              const ordered = sortBy(ordFn, [maxValue, lastMaxValue]);
              (ordered[0] === maxValue && ordered[1] === lastMaxValue) ||
                DIE(`
mergeDescends Error: one of source stream is not descending ordered.

prev: ${JSON.stringify(lastMaxValue)}

curr: ${JSON.stringify(maxValue)}
`);
            }
            lastMaxValue = maxValue;
            ctrl.enqueue(maxValue);
            slots[maxIndex] = undefined;
            pendingSlotRemoval[maxIndex]?.resolve();
            pendingSlotRemoval[maxIndex] = undefined;
            return true;
          }
        })
      );
    },
  }));
};
