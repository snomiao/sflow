export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Comparable type for ordering (replaces rambda's Ord) */
export type Ord = string | number;

/** Sort array by a key function (replaces rambda's sortBy) */
export function sortBy<T>(fn: (x: T) => Ord, arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const oa = fn(a);
    const ob = fn(b);
    return oa < ob ? -1 : oa > ob ? 1 : 0;
  });
}

/** Find minimum element by key function — O(N) instead of O(N log N) */
export function minBy<T>(fn: (x: T) => Ord, arr: T[]): T {
  let min = arr[0]!;
  for (let i = 1; i < arr.length; i++) {
    if (fn(arr[i]!) < fn(min)) min = arr[i]!;
  }
  return min;
}

/** Find maximum element by key function — O(N) instead of O(N log N) */
export function maxBy<T>(fn: (x: T) => Ord, arr: T[]): T {
  let max = arr[0]!;
  for (let i = 1; i < arr.length; i++) {
    if (fn(arr[i]!) > fn(max)) max = arr[i]!;
  }
  return max;
}

/** Deep equality check for plain JSON values (replaces rambda's equals) */
export function deepEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => deepEquals(v, b[i]));
  }
  if (typeof a === "object") {
    const ka = Object.keys(a as Record<string, unknown>);
    const kb = Object.keys(b as Record<string, unknown>);
    if (ka.length !== kb.length) return false;
    return ka.every((k) =>
      deepEquals(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
      ),
    );
  }
  return false;
}

/** Generate a range of numbers [start, end) — replaces rambda's range */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, i) => start + i);
}
