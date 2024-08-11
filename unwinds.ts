import { unwind } from "unwind-array";
import type { Unwinded } from "./Unwinded";
import { flatMaps } from "./flatMaps";

export function unwinds<
  T extends Record<string, any>,
  K extends keyof T & string,
>(key: K) {
  return flatMaps<T, Unwinded<T, K>>(
    (e) => unwind(e, { path: key }) as Unwinded<T, K>[],
  );
}
