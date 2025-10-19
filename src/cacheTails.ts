import DIE from "phpdie";
import { equals } from "rambda";
import type { Awaitable } from "./Awaitable";
import { never } from "./never";

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
  const cachePromise = Promise.withResolvers<T[]>();
  const t = new TransformStream();
  const w = t.writable.getWriter();
  const writable = new WritableStream({
    start: async () => cachePromise.resolve((await store.get(key)) ?? []),
    write: async (chunk, ctrl) => {
      const cache = await cachePromise.promise;
      if (cache && equals(chunk, cache[0])) {
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
