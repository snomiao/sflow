import { sleep } from "bun";
import { confluences } from "./confluences";
import { sf } from "./index";

it("As stream kernel", async () => {
  const flow1 = sf([1, 2, 3]);
  const flow2 = sf([4, 5, 6]);
  expect(
    await sf([flow1, flow2])
      .through((e) => e.pipeThrough(confluences()))
      .peek((e) => expect(typeof e === "number").toBeTruthy())
      .toArray()
  ).toEqual([1, 4, 2, 5, 3, 6]);
});
it("As pipeline kernel", async () => {
  expect(
    await sf([sf([1, 2, 3]), sf([4, 5, 6])])
      .through(confluences())
      .toArray()
  ).toEqual([1, 4, 2, 5, 3, 6]);
});
it("As pipeline", async () => {
  expect(
    await sf([sf([1, 2, 3]), sf([4, 5, 6])])
      .confluence()
      .toArray()
  ).toEqual([1, 4, 2, 5, 3, 6]);
});
it("breadth first search", async () => {
  expect(
    await sf([sf([1, 2, 3]), sf([4, 5, 6]), sf([7, 8, 9])])
      .confluence()
      .toArray()
  ).toEqual([1, 4, 7, 2, 5, 8, 3, 6, 9]);
});
it("works for different length flow", async () => {
  expect(
    await sf([sf([1]), sf([4, 5]), sf([7, 8, 9])])
      .confluence()
      .toArray()
  ).toEqual([1, 4, 7, 5, 8, 9]);
});
it("lazy read", async () => {
  const fn1 = jest.fn();
  const fn2 = jest.fn();

  const flow = sf([
    sf([1]).forEach(fn1),
    sf([4, 5]).forEach(fn2),
    sf([7, 8, 9]),
  ]);
  await sleep(10);
  expect(fn1).not.toHaveBeenCalled();
  expect(fn2).not.toHaveBeenCalled();
  console.log("conf");
  const conFlow = flow.confluence(); // will read only 1 src
  await sleep(10);
  expect(fn1).toHaveBeenCalled();
  expect(fn2).not.toHaveBeenCalled();

  console.log("conf2");
  const res = await conFlow.toArray();
  await sleep(10);
  expect(fn1).toHaveBeenCalled();
  expect(fn2).toHaveBeenCalled();

  expect(res).toEqual([1, 4, 7, 5, 8, 9]);
});
