import { sleep } from "bun";
import { sflow } from "./sflow";

it("Infinity concurrent", async () => {
  const runOrder: number[] = [];
  const finishOrder: number[] = [];
  const returnOrder = await sflow([1, 2, 3, 4, 4, 3, 2, 1])
    .pMap(async (e, i) => {
      runOrder.push(e);
      await sleep(e * 10);
      finishOrder.push(e);
      console.log(e, i);
      return e;
    })
    .toArray();
  expect(runOrder).toEqual([1, 2, 3, 4, 4, 3, 2, 1]);
  expect(finishOrder).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  expect(returnOrder).toEqual([1, 2, 3, 4, 4, 3, 2, 1]);
});
it("pmaps", async () => {
  const t = Date.now();
  const req = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const acc = sflow(req.toReversed())
    .pMap(3, async (n) => {
      await new Promise((r) => setTimeout(r, n * 100));
      return n;
    })
    .toArray();
  expect(acc).resolves.toEqual(req.toReversed());
})