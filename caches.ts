import type { Awaitable } from "./Awaitable";
import { never } from "./never";

/**
 * 1. cache whole list once upstream flushed
 * 2. Replace the stream with cached list if exist
 */
export function cacheLists<T>(
  store: {
    has?: (key: string) => Awaitable<boolean>;
    get: (key: string) => Awaitable<T[] | undefined>;
    set: (key: string, chunks: T[]) => Awaitable<any>;
  },
  /**
   * Key could step name,
   * or `new Error().stack` if you lazy enough
   */
  key: string = new Error().stack!
) {
  const chunks: T[] = [];
  const cacheHitPromise = (store.has || store.get)(key);
  const t = new TransformStream();
  // TODO: optimize

  //   const writable = new WritableStream({
  //     start: async (ctrl) => {
  //       console.log({ chp: await cacheHitPromise });
  //       if (await cacheHitPromise) await ctrl.error("cache hit");
  //     },
  //     write: async (chunk, ctrl) => {
  //       // never resolve if cache hit
  //       console.log("never resolve if cache hit");
  //       if (await cacheHitPromise) {
  //         await writable.close();
  //         return;
  //       }
  //       chunks.push(chunk);
  //       const w = t.writable.getWriter();
  //       await w.write(chunk);
  //       w.releaseLock();
  //     },
  //     close: async () => {
  //       await store.set(key, chunks);
  //       await t.writable.close();
  //     },
  //   });
  //   const readable = new ReadableStream({
  //     start: async (ctrl) => {
  //       // get cache
  //       console.log("get cache");
  //       const cached = (await cacheHitPromise) && (await store.get(key));
  //       if (!cached) return;
  //       // emit if exist
  //       console.log("emit if exist");
  //       cached.map((c) => ctrl.enqueue(c));
  //       ctrl.close();
  //       //   await writable.close();
  //       // return ctrl.terminate();
  //       console.log("return ctrl.terminate();");
  //     },
  //     pull: async (ctrl) => {
  //       // pull upstream when downstream pull
  //       console.log("pull upstream when downstream pull");
  //       const r = t.readable.getReader();
  //       const { value, done } = await r.read();
  //       r.releaseLock();
  //       if (done) return ctrl.close();
  //       ctrl.enqueue(value);
  //     },
  //   });
  //   return { writable, readable };
  return new TransformStream({
    start: async (ctrl) => {
      // check
      if (!(await cacheHitPromise)) return;
      // get
      const cached = await store.get(key);
      if (!cached) return;
      // emit cache, return never to disable pulling upstream
      cached.map((c) => ctrl.enqueue(c));
      // ctrl.terminate();
      // return never();
    },
    transform: async (chunk, ctrl) => {
      if (await cacheHitPromise) {
        ctrl.terminate();
        return never();
      }
      chunks.push(chunk);
      ctrl.enqueue(chunk);
    },
    flush: async () => {
      if (await cacheHitPromise) return;
      await store.set(key, chunks);
    },
  });
}
