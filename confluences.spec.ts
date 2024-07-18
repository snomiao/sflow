import { sf } from ".";
import { confluences } from "./confluences";

it("As stream kernel", async () => {
  expect(
    await sf([sf([1, 2, 3]), sf([4, 5, 6])])
      .through((e) => e.pipeThrough(confluences()))
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
