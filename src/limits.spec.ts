import { sflow } from "./sflow";

it("works", async () => {
  const fn0 = jest.fn();
  const fn1 = jest.fn();
  expect(
    await sflow([1, 2, 3, 4]).forEach(fn0).limit(2).forEach(fn1).toArray(),
  ).toEqual([1, 2]);
  expect(fn0).toHaveBeenCalledTimes(2); // lazy limit
  expect(fn1).toHaveBeenCalledTimes(2);
});
