/** Confluence of multiple flow sources by breadth first */
export const confluences = <T>(): TransformStream<ReadableStream<T>, T> => {
  const { writable, readable: sources } = new TransformStream<
    ReadableStream<T>,
    ReadableStream<T>
  >();
  const srcsQueue: ReadableStream<T>[] = [];
  const readable = new ReadableStream({
    async pull(ctrl) {
      while (true) {
        // console.log('pull')
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
