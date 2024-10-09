import DIE from "phpdie";
import type { Awaitable } from "./Awaitable";
import { never } from "./never";

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
        /** defaults to 1, incase first n header may modify by others you could set it as 2 */
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
      const chunkJSON = JSON.stringify(chunk);
      const cachedIndex = cache?.findIndex(
        (item) => JSON.stringify(item) === chunkJSON
      );
      if (cache && cachedIndex && cachedIndex !== -1) {
        await store.set(
          key,
          [...chunks, ...cache.slice(cachedIndex)].slice(0, windowSize)
        );
        ctrl.terminate();
        return await never();
      }
      chunks.push(chunk);
      ctrl.enqueue(chunk);
    },
    flush: async () => {
      await store.set(key, chunks.slice(0, windowSize));
    },
  });
}
