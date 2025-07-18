import { rangeStream } from "./rangeStream";
import { sflow } from "./sf";

it("works", async () => {
  expect(await sflow(rangeStream(5)).toArray()).toEqual([0, 1, 2, 3, 4]);
  expect(await sflow(rangeStream(0, 5)).toArray()).toEqual([0, 1, 2, 3, 4]);
});
