import DIE from "@snomiao/die";
import { sortBy, type Ord } from "rambda";
import { snoflow } from ".";

export const mergeAscends = <T>(
  compareFn: (input: T) => Ord,
  ...srcs: ReadableStream<T>[]
) => {
  const slots = srcs.map(() => null as T | null);
  const pendingSlotRemoval = srcs.map(
    () => null as PromiseWithResolvers<void> | null
  );
  const drains = srcs.map(() => false);
  let lastMinValue: T | null = null;
  return snoflow(
    new ReadableStream({
      start: async (w) => {
        await Promise.all(
          srcs.map(async (src, i) => {
            for await (const item of snoflow(src)) {
              while (slots[i] != null) {
                if (shiftMinValueIfFull()) continue;
                pendingSlotRemoval[i] = Promise.withResolvers<void>();
                await pendingSlotRemoval[i]!.promise; // wait for this slot empty;
              }
              slots[i] = item;
              shiftMinValueIfFull();
            }
            // done
            drains[i] = true;
            pendingSlotRemoval.map((e) => e?.resolve());
            // await Promise.all(pendingSlotRemoval.map((e) => e?.promise));
            const allDrain = drains.every(Boolean);
            if (allDrain) w.close();

            function shiftMinValueIfFull() {
              const isFull = slots.every(
                (slot, i) => slot !== null || drains[i]
              );
              if (!isFull) return false;
              const fullSlots = slots.flatMap((e) => (e !== null ? [e] : []));
              const minValue = sortBy(compareFn, fullSlots)[0];
              const minIndex = slots.findIndex((e) => e === minValue);
              if (lastMinValue !== null) {
                compareFn(lastMinValue) <= compareFn(minValue) ||
                  DIE(
                    "FATAL: one of source stream is not ascending. " +
                      JSON.stringify({ prev: lastMinValue, current: minValue })
                  );
              }
              lastMinValue = minValue;
              w.enqueue(minValue);
              slots[minIndex] = null;
              pendingSlotRemoval[minIndex]?.resolve();
              pendingSlotRemoval[minIndex] = null;
              return true;
            }
          })
        );
      },
    })
  );
};
