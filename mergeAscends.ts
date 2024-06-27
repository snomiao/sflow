import DIE from "@snomiao/die";
import { sortBy, type Ord } from "rambda";
import { snoflow, type flowSource } from ".";
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
export const mergeAscends: {
  <T>(ordFn: (input: T) => Ord): {
    (srcs: flowSource<flowSource<T>>): snoflow<T>;
  };
  <T>(ordFn: (input: T) => Ord, srcs: flowSource<flowSource<T>>): snoflow<T>;
} = <T>(ordFn: (input: T) => Ord, _srcs?: flowSource<flowSource<T>>) => {
  if (!_srcs) return ((srcs: any) => mergeAscends(ordFn, srcs)) as any;
  return snoflow(
    new ReadableStream({
      start: async (ctrl) => {
        const srcs = await snoflow(_srcs).toArray();
        const slots = srcs.map(() => undefined as { value: T } | undefined);
        const pendingSlotRemoval = srcs.map(
          () => undefined as PromiseWithResolvers<void> | undefined
        );
        const drains = srcs.map(() => false);
        let lastMinValue: T | undefined = undefined;
        await Promise.all(
          srcs.map(async (src, i) => {
            for await (const value of snoflow(src)) {
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
                ordFn(lastMinValue) <= ordFn(minValue) ||
                  DIE(
                    "FATAL: one of source stream is not ascending. " +
                      JSON.stringify({
                        prev: lastMinValue,
                        current: minValue,
                      })
                  );
              }
              lastMinValue = minValue;
              // @ts-expect-error minValue could be undefined
              ctrl.enqueue(minValue);
              slots[minIndex] = undefined;
              pendingSlotRemoval[minIndex]?.resolve();
              pendingSlotRemoval[minIndex] = undefined;
              return true;
            }
          })
        );
      },
    })
  );
};
