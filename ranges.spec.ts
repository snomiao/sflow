import { sf } from ".";
import { rangeStream } from "./rangeStream";

it("works", async () => {
  expect(await sf(rangeStream(5)).toArray()).toEqual([0, 1, 2, 3, 4]);
  expect(await sf(rangeStream(0, 5)).toArray()).toEqual([0, 1, 2, 3, 4]);
});


