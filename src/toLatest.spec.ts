import sflow from "./index";
import { toLatests } from "./toLatest";
import { sleep } from "./utils";

it("Get the latest value", async () => {
  const ret = toLatests(
    sflow([1, 2, 3]).forEach(async (_e) => {
      await sleep(10);
    }),
  );

  // wait for first emit
  expect(await ret.latest).toEqual(1);
  await sleep(100);
  expect(await ret.latest).toEqual(3);
});

it("works number", async () => {
  const ret = toLatests(
    sflow([1, 2, 3]).forEach(async (_e) => {
      await sleep(10);
    }),
  );

  // wait for first emit
  expect(await ret.latest).toEqual(1);

  expect(await ret.next).toEqual(2);
  expect(await ret.latest).toEqual(2);

  expect(await ret.next).toEqual(3);
  expect(await ret.latest).toEqual(3);

  expect(await ret.next).toEqual(undefined);

  expect(await ret.latest).toEqual(3);

  expect(await ret.next).toEqual(undefined);
});

it("works obj", async () => {
  const ret = toLatests(
    sflow([{ b: 1 }, { a: { b: { c: 2 } } }, { c: 3 }]).forEach(async () => {
      await sleep(10);
    }),
  );

  // wait for first emit
  expect(await ret.latest).toEqual({ b: 1 });

  // @ts-expect-error
  expect(await ret.next).toEqual({ a: { b: { c: 2 } } });
  expect(await ret.latest).toEqual({ a: { b: { c: 2 } } });

  expect(await ret.next).toEqual({ c: 3 });
  expect(await ret.latest).toEqual({ c: 3 });

  expect(await ret.next).toEqual(undefined);

  expect(await ret.next).toEqual(undefined);

  expect(await ret.latest).toEqual({ c: 3 });
});
