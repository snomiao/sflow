import DIE from "phpdie";
import type { Awaitable } from "./Awaitable";
import { never } from "./never";

/**
 * 1. cache whole list once upstream flushed
 * 2. Replace the stream with cached list if exist
 *
 * Set ttl in your store settings
 *
 * This step should place at near the output end.
 * @deprecated use cacheSkips to reduce cache size
 */
export function cacheLists<T>(
  store: {
    has?: (key: string) => Awaitable<boolean>;
    get: (key: string) => Awaitable<T[] | undefined>;
    set: (key: string, chunks: T[]) => Awaitable<void>;
  },
  _options?:
    | string
    | {
        /**
         * Key could step name,
         * or defaults to `new Error().stack` if you r lazy enough
         */
        key?: string;
      },
) {
  // parse options
  const { key = new Error().stack ?? DIE("missing cache key") } =
    typeof _options === "string" ? { key: _options } : (_options ?? {});
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
      cached.map((c) => ctrl.enqueue(c));
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
