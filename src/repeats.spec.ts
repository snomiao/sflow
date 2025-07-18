import { repeats } from "./repeats";
import { sflow } from "./sf";

it("works", async () => {
  expect(await sflow([1, 2, 3]).byLazy(repeats(2)).toArray()).toEqual([
    1, 1, 2, 2, 3, 3,
  ]);
});

it("works infinity", async () => {
  expect(await sflow([1, 2, 3]).by(repeats()).limit(5).toArray()).toEqual([
    1, 1, 1, 1, 1,
  ]);
});

// it("works infinity", async () => {
//   expect(await sflow([1, 2, 3]).byLazy(repeats()).limit(5).toArray()).toEqual([
//     1, 1, 1, 1, 1,
//   ]);
// });
