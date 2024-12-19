import { distributeBys } from "./distributeBys";
import { sf } from "./index";
import { rangeStream } from "./rangeStream";

it("distributeBys", async () => {
  expect(
    await sf(rangeStream(10))
      .through(distributeBys((e: number) => e % 3))
      .pMap((s) => sf(s).toArray())
      .toArray(),
  ).toEqual([
    [0, 3, 6, 9],
    [1, 4, 7],
    [2, 5, 8],
  ]);
});
