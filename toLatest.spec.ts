import { sleep } from "bun";
import sflow from ".";
it.skip("works number", async () => {
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

it("works obj", async () => {
  const obj = await sflow([{ a: 1 }, { a: { b: { c: 2 } } }, { a: 3 }])
    .forEach(async () => {
      await sleep(10);
    })
    .toLatest();
  await sleep(5);
  console.log(obj);
  expect(obj.value).toEqual({ a: 1 });
  await sleep(10);
  expect(obj.value).toEqual({ a: { b: { c: 2 } } });
  // @ts-ignore
  expect(obj.value.a.b.c).toEqual(2);
  await sleep(10);
  expect(obj.value).toEqual({ a: 3 });
});
