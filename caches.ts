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
       * @deprecated use cacheSkips
       * true: emit cached content (default)
       * false: just bypass, only emit contents not in cache
       */
      emitCached?: boolean;
      // /** ttl in ms */
      // ttl?:number
    };

const jsonEquals = (a: any, b: any) =>
  new Set([a, b].map((e) => JSON.stringify(e))).size === 1;

/**
 * Assume Stream content is ordered plain json object, (class is not supported)
 * And new element always insert into head
 *
 * Only emit unmet contents
 *
 * Once flow done, cache content, and skip cached content next time
 */
export function cacheSkips<T>(
  store: {
    has?: (key: string) => Awaitable<boolean>;
    get: (key: string) => Awaitable<T[] | undefined>;
    set: (key: string, chunks: T[]) => Awaitable<any>;
  },
  _options?:
    | string
    | {
        /**
         * Key could step name,
         * or defaults to `new Error().stack` if you r lazy enough
         */
        key?: string;
        /** defaults to 1 */
        windowSize?: number;
      }
) {
  // parse options
  const {
    key = new Error().stack ?? DIE("missing cache key"),
    windowSize = 1,
  } = typeof _options === "string" ? { key: _options } : _options ?? {};
  const chunks: T[] = [];
  const cachePromise = store.get(key);
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      const cache = await cachePromise;
      if (cache?.length) {
        await store.set(key, chunks.concat(...cache).slice(0, windowSize));
        ctrl.terminate();
        return await never();
      }
      chunks.push(chunk);
      ctrl.enqueue(chunk);
    },
    flush: async () => await store.set(key, chunks.slice(0, windowSize)),
  });
}

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
  const { key = new Error().stack ?? DIE("missing cache key") } =
    typeof _options === "string" ? { key: _options } : _options ?? {};
  const chunks: T[] = [];
  const cachePromise = Promise.withResolvers<T[]>();
  const t = new TransformStream();
  const w = t.writable.getWriter();
  const writable = new WritableStream({
    start: async () => cachePromise.resolve(await store.get(key)),
    write: async (chunk, ctrl) => {
      const cache = await cachePromise.promise;
      if (cache && equals(chunk, cache[0])) {
        console.log("asdf");
        // save cache
        await store.set(key, [...chunks, ...cache]);
        // emit whole cache as tail into downstream
        for await (const item of cache) await w.write(item);
        await w.close();

        // await t.readable.cancel(new Error('Cached'))
        // cancel upstream if need...
        ctrl.error(new Error("cached"));
        // return;
        return await never();
      }
      chunks.push(chunk);
      await w.write(chunk);
    },
    close: async () => {
      await store.set(key, [...chunks]);
      await w.close();
    },
    abort: () => w.abort(),
  });
  return { writable, readable: t.readable };
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
  let hitflag = false;
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
      hitflag = true;
    },
    transform: async (chunk, ctrl) => {
      if ((await cacheHitPromise) || hitflag) {
        ctrl.terminate();
        return never();
      }
      chunks.push(chunk);
      ctrl.enqueue(chunk);
    },
    flush: async () => await store.set(key, chunks),
  });
}
