import { snoflow } from "./sflow";
it("works", async () => {
  expect(
    await snoflow([{ a: 1, b: [1, 2, 3], c: [1, 2, 3] }])
      .unwind("b")
      .map((e) => e)
      .toArray()
  ).toEqual([
    { a: 1, b: 1, c: [1, 2, 3] },
    { a: 1, b: 2, c: [1, 2, 3] },
    { a: 1, b: 3, c: [1, 2, 3] },
  ]);
});
