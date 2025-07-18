import { distributeBys } from "./distributeBys";
import { rangeStream } from "./rangeStream";
import { sflow } from "./sf";

it("distributeBys", async () => {
  expect(
    await sflow(rangeStream(10))
      .through(distributeBys((e: number) => e % 3))
      .pMap((s) => sflow(s).toArray())
      .toArray(),
  ).toEqual([
    [0, 3, 6, 9],
    [1, 4, 7],
    [2, 5, 8],
  ]);
});
