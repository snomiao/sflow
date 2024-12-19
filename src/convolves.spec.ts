import { convolves } from "./convolves";
import sflow from "./index";

it("convolve 1 in pipeline", async () => {
  expect(await sflow([1, 2, 3, 4]).convolve(1).toArray()).toEqual([
    [1],
    [2],
    [3],
    [4],
  ]);
});
it("convolve 1", async () => {
  expect(await sflow([1, 2, 3, 4]).through(convolves(1)).toArray()).toEqual([
    [1],
    [2],
    [3],
    [4],
  ]);
});
it("convolve 2", async () => {
  expect(await sflow([1, 2, 3, 4]).through(convolves(2)).toArray()).toEqual([
    [1, 2],
    [2, 3],
    [3, 4],
  ]);
});
it("convolve 3", async () => {
  expect(await sflow([1, 2, 3, 4]).through(convolves(3)).toArray()).toEqual([
    [1, 2, 3],
    [2, 3, 4],
  ]);
});
it("convolve smaller array", async () => {
  expect(await sflow([1, 2, 3, 4]).through(convolves(5)).toArray()).toEqual([]);
});
