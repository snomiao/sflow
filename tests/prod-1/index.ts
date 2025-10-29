import { mergeDescends } from "sflow";

// This should reproduce the type error
const _result = mergeDescends(
  (x: number) => x,
  [
    [1, 2, 3],
    [4, 5, 6],
  ],
);
