import { sleep } from "bun";
import sflow from ".";
it("works", async () => {
  const obj = await sflow([1, 2, 3])
    .forEach(async () => {
      await sleep(10);
    })
    .toLatest();
  await sleep(5);
  console.log(obj);
  expect(obj.value).toEqual(1);
  expect(obj.done).toEqual(false);
  await sleep(10);
  expect(obj.value).toEqual(2);
  expect(obj.done).toEqual(false);
  await sleep(10);
  expect(obj.value).toEqual(3);
  expect(obj.done).toEqual(true);
});