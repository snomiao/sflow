import DIE from "phpdie";
import { equals } from "rambda";
import type { Awaitable } from "./Awaitable";
import { never } from "./never";
type CacheOptions =
  | string
  | {
      /**
       * Key could step name,
       * or defaults to `new Error().stack` if you r lazy enough
       */
      key?: string;
      /**
       * true: emit cached content (default)
       * false: just bypass, only emit contents not in cache
       */
      emitCached?: boolean;
    };

/**
 * Assume Stream content is ordered plain json object, (class is not supported)
 * And new element always insert into head
 *
 * Set ttl in your store settings
 *
 * 1. cache whole list once upstream flushed
 * 2. Stop upstream and Continue with cached list once head matched
 *
 * This step should place at near the output end.
 */
export function cacheTails<T>(
  store: {
    has?: (key: string) => Awaitable<boolean>;
    get: (key: string) => Awaitable<T[] | undefined>;
    set: (key: string, chunks: T[]) => Awaitable<any>;
  },
  _options?: CacheOptions
) {
  // parse options
  const {
    key = new Error().stack ?? DIE("missing cache key"),
    emitCached = true,
  } = typeof _options === "string" ? { key: _options } : _options ?? {};

  const chunks: T[] = [];
  const tailChunks: T[] = [];
  // const cacheHitPromise = (store.has?.(key) || store.get(key))
  // get
  const cachePromise = store.get(key);
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      const cache = await cachePromise;
      if (cache) {
        console.log(chunk, cache);
        if (equals(chunk, cache[0])) {
          // append cache into chunks, and will store on flush
          tailChunks.push(...cache);

          // emit whole cache as head
          if (emitCached) cache.map((c) => ctrl.enqueue(c));

          ctrl.terminate();
          await store.set(key, [...chunks, ...tailChunks]);
          console.log(chunk, cache);
          return await never();
        }
      }

      chunks.push(chunk);
      ctrl.enqueue(chunk);
    },
    flush: async () => {
      if (!(await cachePromise)) return await store.set(key, chunks);
    },
  });
}

/**
 * 1. cache whole list once upstream flushed
 * 2. Replace the stream with cached list if exist
 *
 * Set ttl in your store settings
 *
 * This step should place at near the output end.
 */
export function cacheLists<T>(
  store: {
    has?: (key: string) => Awaitable<boolean>;
    get: (key: string) => Awaitable<T[] | undefined>;
    set: (key: string, chunks: T[]) => Awaitable<any>;
  },
  _options?: CacheOptions
) {
  // parse options
  const {
    key = new Error().stack ?? DIE("missing cache key"),
    emitCached = true,
  } = typeof _options === "string" ? { key: _options } : _options ?? {};

  const chunks: T[] = [];
  const cacheHitPromise = store.has?.(key) || store.get(key);
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
      if (emitCached) cached.map((c) => ctrl.enqueue(c));
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
