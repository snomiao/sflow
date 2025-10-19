import DIE from "phpdie";
import type { Awaitable } from "./Awaitable";
import { never } from "./never";

/**
 * Assume Stream content is ordered plain json object, (class is not supported)
 * And new element always insert into head
 *
 * Only emit unmet contents
 *
 * Once flow done, cache latest contents in windowSize, and skip from cached content next time
 *
 *
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
      },
) {
  // parse options
  const {
    key = new Error().stack ?? DIE("missing cache key"),
    windowSize = 1,
  } = typeof _options === "string" ? { key: _options } : (_options ?? {});
  const chunks: T[] = [];
  const cachePromise = store.get(key);
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      const cache = await cachePromise;
      const chunked = JSON.stringify(chunk);
      const inf404 = (idx?: number | null) =>
        idx == null || idx < 0 ? Infinity : idx;
      const hitCache = (item: T): boolean => JSON.stringify(item) === chunked;
      const cachedContents = cache?.slice(inf404(cache.findIndex(hitCache)));
      if (cachedContents?.length) {
        await store.set(
          key,
          [...chunks, ...cachedContents].slice(0, windowSize),
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
