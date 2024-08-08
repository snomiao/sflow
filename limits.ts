import { never } from "./never";

/** Currently will not pipe down more items after count satisfied */
export function limits<T>(n: number, { terminate = true } = {}) {
  return new TransformStream<T, T>(
    {
      transform: async (chunk, ctrl) => {
        ctrl.enqueue(chunk);
        // ensure not pull more items from upstream
        if (--n === 0) {
          terminate && ctrl.terminate();
          return never();
        }
      },
      flush: () => {},
    },
    { highWaterMark: 1 },
    { highWaterMark: 0 }
  );
}
