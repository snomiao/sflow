import type { Awaitable } from "./Awaitable";
import { maps } from "./maps";
import { reduces } from "./reduces";
import { throughs } from "./throughs";

/** uniq by a new Set(), note: use === to compare */
export const uniqs = <T>(): TransformStream<T, T> =>
  throughs((s) =>
    s
      .pipeThrough(
        reduces({ set: new Set<T>(), next: null as T }, (s, x: T) => {
          if (s.set.has(x)) return;
          s.set.add(x);
          s.next = x;
          return s;
        })
      )
      .pipeThrough(maps((s) => s.next))
  );

/** uniq by a new Map(), note: use === to compare keys, so don't return object from keyFn.*/
export const uniqBys = <T, K>(
  keyFn: (x: T) => Awaitable<K>
): TransformStream<T, T> =>
  throughs((s) =>
    s
      .pipeThrough(
        reduces({ set: new Map<K, T>(), next: null as T }, async (s, x: T) => {
          const key = await keyFn(x);
          if (s.set.has(key)) return;
          s.set.set(key, x);
          s.next = x;
          return s;
        })
      )
      .pipeThrough(maps((s) => s.next))
  );
