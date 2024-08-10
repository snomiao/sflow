import DIE from "phpdie";

/** Confluence of multiple flow sources by breadth first */
export const confluences = <T>({
  order = "breadth",
}: {
  order?: "breadth" | "deepth" | "faster";
} = {}): TransformStream<ReadableStream<T>, T> => {
  if (order !== "breadth") DIE("not implemented");
  const { writable, readable: sources } = new TransformStream<
    ReadableStream<T>,
    ReadableStream<T>
  >();
  const srcsQueue: ReadableStream<T>[] = [];
  const readable = new ReadableStream({
    async pull(ctrl) {
      while (true) {
        const src = await (async function () {
          // get from source first
          const r = sources.getReader();
          const { done, value: src } = await r.read();
          r.releaseLock();
          if (done) return srcsQueue.shift(); // use queue if sources drain
          return src;
        })();
        if (!src) return ctrl.close();
        const r = src.getReader();
        const { done, value } = await r.read();
        r.releaseLock();
        if (done) continue; // try next src
        srcsQueue.push(src); // enqueue this src if not done
        ctrl.enqueue(value);
        return;
      }
    },
  });
  return { writable, readable };
};
