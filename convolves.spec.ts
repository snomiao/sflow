import { toArray } from "web-streams-extensions";
import sflow from ".";
import { convolves } from "./convolves";

it("convolve 1 in pipeline", async () => {
  expect(await toArray(await sflow([1, 2, 3, 4]).convolve(1))).toEqual([
    [1],
    [2],
    [3],
    [4],
  ]);
});
it("convolve 1", async () => {
  expect(
    await toArray(await sflow([1, 2, 3, 4]).pipeThrough(convolves(1)))
  ).toEqual([[1], [2], [3], [4]]);
});
it("convolve 2", async () => {
  expect(
    await toArray(await sflow([1, 2, 3, 4]).pipeThrough(convolves(2)))
  ).toEqual([
    [1, 2],
    [2, 3],
    [3, 4],
  ]);
});
it("convolve 3", async () => {
  expect(
    await toArray(await sflow([1, 2, 3, 4]).pipeThrough(convolves(3)))
  ).toEqual([
    [1, 2, 3],
    [2, 3, 4],
  ]);
});
it("convolve smaller array", async () => {
  expect(
    await toArray(await sflow([1, 2, 3, 4]).pipeThrough(convolves(5)))
  ).toEqual([]);
});
