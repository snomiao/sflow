import { sflow } from "./sflow";
it("chunkBy", async () => {
  const out = await sflow([1, 1.1, 1.00002, 1.9, 3, 3, 3, 3, 4, 5, 4, 3])
    .chunkBy((x) => Math.floor(x))
    .toArray();
  console.log(out);
  expect(out).toEqual([
    [1, 1.1, 1.00002, 1.9], // same floor will chunk together
    [3, 3, 3, 3], // same ord will chunk together
    [4], // single item
    [5], // break order
    [4], // only chunk continues order
    [3], // chunk single item
  ]);
});
