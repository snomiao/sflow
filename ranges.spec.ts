import { sf } from ".";
import { ranges } from "./ranges";

it("works", async () => {
  expect(await sf(ranges(5)).toArray()).toEqual([0, 1, 2, 3, 4]);
  expect(await sf(ranges(0, 5)).toArray()).toEqual([0, 1, 2, 3, 4]);
});


