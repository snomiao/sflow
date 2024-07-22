import { sf } from ".";
import { distributeBys } from "./distributeBys";
import { rangeStream } from "./ranges";

it("works", async () => {
  expect(
    await sf(rangeStream(10))
      .through(distributeBys((e: number) => e % 3))
      .pMap((s) => sf(s).toArray())
      .toArray()
  ).toEqual([
    [0, 3, 6, 9],
    [1, 4, 7],
    [2, 5, 8],
  ]);
});

