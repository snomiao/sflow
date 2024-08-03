import { never } from "./never";

/** Currently will not pipe down more items after count satisfied */
export function limits<T>(n = 1, { terminate = true } = {}) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      if (n-- > 0) {
        ctrl.enqueue(chunk);
        return;
      }
      terminate && ctrl.terminate();
      return await never();
    },
    flush: () => {},
  });
}
