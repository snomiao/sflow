import { sleep } from "bun";
import { snoflow } from ".";

it("Infinity concurrent", async () => {
  const runOrder: number[] = [];
  const finishOrder: number[] = [];
  const returnOrder = await snoflow([1, 2, 3, 4, 4, 3, 2, 1])
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
