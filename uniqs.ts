import type { Awaitable } from "./Awaitable";
import { filters } from "./filters";
import { throughs } from "./throughs";

/** uniq by a new Set(), note: use === to compare */
export const uniqs = <T>(): TransformStream<T, T> => {
  const set = new Set<T>();
  return throughs((s) =>
    s.pipeThrough(
      filters((x: T) => {
        if (set.has(x)) return false;
        set.add(x);
        return true;
      }),
    ),
  );
};

/** uniq by a new Map(), Note: use === to compare keys */
export const uniqBys = <T, K>(
  keyFn: (x: T) => Awaitable<K>,
): TransformStream<T, T> => {
  const set = new Set<K>();
  return throughs((s) =>
    s.pipeThrough(
      filters(async (x: T) => {
        const key = await keyFn(x);
        if (set.has(key)) return false;
        set.add(key);
        return true;
      }),
    ),
  );
};
