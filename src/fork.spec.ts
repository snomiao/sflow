import sflow from "./index";

it("forks", async () => {
  const flow1 = sflow([1, 2, 3]);
  const flow2 = flow1.fork().map((e) => e * 2);
  const flow3 = flow1.fork().map((e) => e * 3);
  const flow4 = flow1.fork().map((e) => e * 4);
  expect(await flow1.toArray()).toEqual([1, 2, 3]); // flow1 is still readable after forked
  expect(await flow2.toArray()).toEqual([2, 4, 6]);
  expect(await flow3.toArray()).toEqual([3, 6, 9]);
  expect(await flow4.toArray()).toEqual([4, 8, 12]);
});
