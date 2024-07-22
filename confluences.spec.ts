import { sf } from ".";
import { confluences } from "./confluences";

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
