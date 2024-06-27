import DIE from "@snomiao/die";
import { sortBy, type Ord } from "rambda";
import { snoflow } from ".";

/** @deprecated wip */

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
                const isFull = slots.every(
                  (slot, i) => slot != null || drains[i]
                );
                if (isFull) shiftMinValue();
                pendingSlotRemoval[i] = Promise.withResolvers<void>();
                await pendingSlotRemoval[i]!.promise; // wait for this slot empty;
                // pendings[i] = null;
                // console.log(
                //   new Error().stack?.split("\n").toReversed()[0],
                //   i,
                //   "resolved"
                // );
              }
              slots[i] = item;
              // const allDone = pendingSlotRemoval.every((e) => !e);

              {
                const isFull = slots.every(
                  (slot, i) => slot != null || drains[i]
                );
                // console.log(
                //   new Error().stack?.split("\n").toReversed()[0],
                //   i,
                //   JSON.stringify({ slots, isFull })
                // );
                if (isFull) shiftMinValue();
              }
              // pendings[minIndex] = null;
            }
            // done
            // console.log(new Error().stack?.split("\n").toReversed()[0], i, "drain");
            drains[i] = true;
            pendingSlotRemoval.map((e) => e?.resolve());
            setTimeout(() => {
              pendingSlotRemoval.map((e) => e?.resolve());
            }, 100);
            // pendingSlotRemoval[i] = null;
            const allDrain = drains.every(Boolean);
            if (allDrain) w.close();

            function shiftMinValue() {
              // console.log(new Error().stack?.split("\n").toReversed()[0], i, "full");
              const fullSlots = slots.flatMap((e) => (e != null ? [e] : []));
              const minValue = sortBy(compareFn, fullSlots)[0];
              const minIndex = slots.findIndex((e) => e === minValue);
              if (lastMinValue != null) {
                compareFn(lastMinValue) <= compareFn(minValue) ||
                  DIE(
                    "FATAL: one of source stream is not ascending. " +
                      JSON.stringify({ prev: lastMinValue, current: minValue })
                  );
              }
              lastMinValue = minValue;
              // console.log(
              //   new Error().stack?.split("\n").toReversed()[0],
              //   `min[${minIndex}]=${minValue}`
              // );
              w.enqueue(minValue);
              slots[minIndex] = null;
              pendingSlotRemoval[minIndex]?.resolve();
              pendingSlotRemoval[minIndex] = null;
            }
            // if (allDone) {
            //   await w.close();
            // }
          })
        );
      },
    })
  );
};
