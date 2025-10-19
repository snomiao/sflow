import { unwind } from "unwind-array";
import { flatMaps } from "./flatMaps";
import type { Unwinded } from "./Unwinded";

export function unwinds<
  T extends Record<string, unknown>,
  K extends keyof T & string,
>(key: K) {
  return flatMaps<T, Unwinded<T, K>>(
    (e) => unwind(e, { path: key }) as Unwinded<T, K>[],
  );
}
