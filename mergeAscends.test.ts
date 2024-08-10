import { range } from "rambda";
import { forEachs, mergeAscends, mergeDescends, sflow } from "./";

it("merge asc", async () => {
  const req1 = sflow([0, 1, 2]);
  const req2 = sflow([1, 2, 3]);
  const req3 = sflow([0, 4, 5]);
  const ret = [0, 0, 1, 1, 2, 2, 3, 4, 5];

  expect(
    await sflow(mergeAscends((x) => x, [req1, req2, req3]))
      // .peek(console.log)
      .toArray()
  ).toEqual(ret);
});
it.skip("merge asc lazy", async () => {
  const fn1 = jest.fn();
  const req1 = sflow([0, 1, 2]).byLazy(forEachs(fn1));
  const fn2 = jest.fn();
  const req2 = sflow([1, 2, 3]).byLazy(forEachs(fn2));
  const fn3 = jest.fn();
  const req3 = sflow([0, 4, 5]).byLazy(forEachs(fn3));
  const ret = [0, 0, 1, 1, 2, 2, 3, 4, 5];
  const emi = [1, 3, 2, 1, 2, 1, 2, 3, 3]; // emit order
  const r = sflow(mergeAscends((x) => x, [req1, req2, req3]));
  expect(fn1).toHaveBeenCalledTimes(0);
  expect(fn2).toHaveBeenCalledTimes(0);
  expect(fn3).toHaveBeenCalledTimes(0);
  const reader = r.getReader();
  expect(fn1).toHaveBeenCalledTimes(0);
  expect(fn2).toHaveBeenCalledTimes(0);
  expect(fn3).toHaveBeenCalledTimes(0);
  await reader.read();
  expect(fn1).toHaveBeenCalledTimes(2);
  expect(fn2).toHaveBeenCalledTimes(2);
  expect(fn3).toHaveBeenCalledTimes(1);
  await reader.read();
  expect(fn1).toHaveBeenCalledTimes(2);
  expect(fn2).toHaveBeenCalledTimes(2);
  expect(fn3).toHaveBeenCalledTimes(2);
  await reader.read();
  expect(fn1).toHaveBeenCalledTimes(3);
  expect(fn2).toHaveBeenCalledTimes(2);
  expect(fn3).toHaveBeenCalledTimes(3);
});

it("curried", async () => {
  const req1 = sflow([0, 1, 2]);
  const req2 = sflow([1, 2, 3]);
  const req3 = sflow([0, 4, 5]);
  const ret = [0, 0, 1, 1, 2, 2, 3, 4, 5];

  expect(
    await sflow([req1, req2, req3])
      .through(mergeAscends((x: number) => x)) // merge all flows into one by ascend order
      .toArray()
  ).toEqual(ret);
});

it("merge desc by invert use of asc", async () => {
  const req1 = sflow([0, 1, 2].toReversed());
  const req2 = sflow([1, 2, 3].toReversed());
  const req3 = sflow([0, 4, 5].toReversed());
  const ret = [0, 0, 1, 1, 2, 2, 3, 4, 5].toReversed();

  expect(
    await sflow(mergeAscends((x) => -x, [req1, req2, req3]))
      // .peek(console.log)
      .toArray()
  ).toEqual(ret);
});
it("merge desc by desc export", async () => {
  const req1 = sflow([0, 1, 2].toReversed());
  const req2 = sflow([1, 2, 3].toReversed());
  const req3 = sflow([0, 4, 5].toReversed());
  const ret = [0, 0, 1, 1, 2, 2, 3, 4, 5].toReversed();

  expect(
    await sflow(mergeDescends((x) => x, [req1, req2, req3]))
      // .peek(console.log)
      .toArray()
  ).toEqual(ret);
});

it("merge a super long asc", async () => {
  const req1 = sflow(range(0, 9999).map((e) => 1 + e * 2)); // 1, 3, 5, 7, 9, 11, 13, 15, 17, 19 ...
  const req2 = sflow(range(0, 9999).map((e) => 2 + e * 3)); // 2, 5, 8, 11, 14, 17, 20, 23, 26, 29 ...
  const req3 = sflow(range(0, 9999).map((e) => 3 + e * 5)); // 3, 8, 13, 18, 23, 28, 33, 38, 43, 48 ...
  const ret = range(0, 9999)
    .flatMap((e) => [1 + e * 2, 2 + e * 3, 3 + e * 5])
    .sort((a, b) => a - b);

  expect(
    await sflow(mergeAscends((x) => x, [req1, req2, req3]))
      // .peek(console.log)
      .toArray()
  ).toEqual(ret); // cost about 60ms in my machine
});

it("not throws asc", async () => {
  const req1 = sflow([1, 2, 3]);
  const req2 = sflow([0, 4, 5]);
  expect(
    await sflow(mergeAscends((x) => x, [req1, req2]))
      // .peek(console.log)
      .toArray()
  ).toEqual([0, 1, 2, 3, 4, 5]);
});

it("throws not asc", async () => {
  const req1 = sflow([1, 2, 0]); // not asc
  const req2 = sflow([0, 4, 5]);
  expect(() =>
    sflow(mergeAscends((x) => x, [req1, req2]))
      // .peek(console.log)
      .toArray()
  ).toThrow(/ascending/);
});
