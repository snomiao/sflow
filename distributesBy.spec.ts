import { T } from "rambda";
import { forEachs, maps, sf, throughs } from ".";
import { ranges } from "./ranges";
import { distributesBy } from "./distributesBy";

it("works", async () => {
  expect(
    await sf(ranges(10))
      .through(distributesBy((e: number) => e % 3))
      .pMap((s) => sf(s).toArray())
      .toArray()
  ).toEqual([
    [0, 3, 6, 9],
    [1, 4, 7],
    [2, 5, 8],
  ]);
});

