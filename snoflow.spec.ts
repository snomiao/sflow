import snoflow from ".";

it("totee", async () => {
  const flow0 = snoflow([1, 2, 3]);
  let flow1: snoflow<number>;
  let flow2 = flow0.tees((x) => (flow1 = x));
  let flow3 = flow2.tees((b) => (flow2 = b));
  expect(flow0.locked).toEqual(true);
  expect(await flow1!.toArray()).toEqual([1, 2, 3]);
  expect(await flow2.toArray()).toEqual([1, 2, 3]);
  expect(await flow3.toArray()).toEqual([1, 2, 3]);
});
