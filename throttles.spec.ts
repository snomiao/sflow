import { sleep } from "bun";
import { sflow } from "./";

it("works", async () => {
  // emit: 0, 50, 100, 150
  // pass: 0, __, 100, ___
  expect(
    await sflow([1, 2, 3, 4])
      .forEach(() => sleep(50))
      .throttle(80, { keepLast: false })
      .toArray()
  ).toEqual([1, 3]);
});
it("works keep last", async () => {
  const r = await sflow([1, 2, 3, 4])
    .forEach(() => sleep(50))
    .throttle(80)
    .toArray();
  // emit: 0, 50, 100, 150
  // pass: 0, __, 100, ___
  // pass: 0, __, 100, ___, 180(150) send last item
  console.log(r);
  expect(r).toEqual([1, 3, 4]);
});
it("works", async () => {
  expect(
    await sflow([1, 2, 3, 4])
      .forEach(() => sleep(1000))
      .forEach(() => sleep(1000))
      .log()
      .toArray()
  ).toEqual([1, 2, 3, 4]);
});
