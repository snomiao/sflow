import { range } from "rambda";
import { sf } from ".";
import { forEachs } from "./forEachs";
import { mergeDescends } from "./mergeAscends";
import { mergeStreamsByAscend } from "./mergeStreamsBy";
import { sflow } from "./sflow";

it("merge asc", async () => {
  const req1 = sflow([0, 1, 2]);
  const req2 = sflow([1, 2, 3]);
  const req3 = sflow([0, 4, 5]);
  const ret = [0, 0, 1, 1, 2, 2, 3, 4, 5];

  expect(
    await sflow(mergeStreamsByAscend((x) => x, [req1, req2, req3]))
      .log()
      // .peek(console.log)
      .toArray(),
  ).toEqual(ret);
});

it.skip("drains correctly for different length flow", async () => {
  const s = [0, 1, 2].map(() => jest.fn());
  const f = [0, 1, 2].map(() => jest.fn());
  const end = jest.fn();
  const c = mergeStreamsByAscend(
    (x) => x,
    [
      sf([1]).onStart(s[0]).onFlush(f[0]),
      sf([4, 5]).onStart(s[0]).onFlush(f[1]),
      sf([7, 8, 9]).onStart(s[0]).onFlush(f[2]),
    ],
  ).onFlush(end);

  const r = c.getReader();

  expect(f[0]).not.toHaveBeenCalled();
  expect(f[1]).not.toHaveBeenCalled();
  expect((await r.read()).value).toBe(1); // pulled from [0|1|2] got [1,4,7]  emit 1, f0 drain
  expect((await r.read()).value).toBe(4); // pulled from [0| | ] got [_,4,7]  emit 4,
  expect(f[0]).toHaveBeenCalled();
  expect(f[1]).toHaveBeenCalled();
  expect((await r.read()).value).toBe(5); // pulled from [ |1| ] got [_,5,7]  emit 5
  expect(f[2]).not.toHaveBeenCalled();
  expect((await r.read()).value).toBe(7); // pulled from [ | |2] got [_,_,7]  emit 7
  expect(f[2]).toHaveBeenCalled();
  expect((await r.read()).value).toBe(8); // pulled from [ | |2] got [_,_,8]  emit 8
  expect((await r.read()).value).toBe(9); // pulled from [ | |2] got [_,_,9]  emit 9
  expect(end).not.toHaveBeenCalled();
  expect((await r.read()).value).toBe(undefined); // pulled from [ | |2] got [_,_,_]  drain
  expect(end).toHaveBeenCalled();
});

it("merge asc lazy", async () => {
  const fn1 = jest.fn();
  const req1 = sflow([0, 1, 2]).byLazy(forEachs(fn1));
  const fn2 = jest.fn();
  const req2 = sflow([1, 2, 3]).byLazy(forEachs(fn2));
  const fn3 = jest.fn();
  const req3 = sflow([0, 4, 5]).byLazy(forEachs(fn3));
  const ret = [0, 0, 1, 1, 2, 2, 3, 4, 5];
  const emi = [1, 3, 2, 1, 2, 1, 2, 3, 3]; // emit order
  const r = sflow(mergeStreamsByAscend((x) => x, [req1, req2, req3]));
  expect(fn1).toHaveBeenCalledTimes(0);
  expect(fn2).toHaveBeenCalledTimes(0);
  expect(fn3).toHaveBeenCalledTimes(0);
  const reader = r.getReader();
  expect(fn1).toHaveBeenCalledTimes(0);
  expect(fn2).toHaveBeenCalledTimes(0);
  expect(fn3).toHaveBeenCalledTimes(0);
  await reader.read(); // slots: [0,1,0] => emit[0] 1 => [1,1,0]
  expect(fn1).toHaveBeenCalledTimes(1);
  expect(fn2).toHaveBeenCalledTimes(1);
  expect(fn3).toHaveBeenCalledTimes(1);
  await reader.read(); // slots: [1,1,0] => emit[2] 0 => [1,1,4]
  expect(fn1).toHaveBeenCalledTimes(2);
  expect(fn2).toHaveBeenCalledTimes(1);
  expect(fn3).toHaveBeenCalledTimes(1);
  await reader.read(); // slots: [1,1,4] => emit[0] 1 => [2,1,4]
  expect(fn1).toHaveBeenCalledTimes(2);
  expect(fn2).toHaveBeenCalledTimes(1);
  expect(fn3).toHaveBeenCalledTimes(2);
});

// it("curried", async () => {
//   const req1 = sflow([0, 1, 2]);
//   const req2 = sflow([1, 2, 3]);
//   const req3 = sflow([0, 4, 5]);
//   const ret = [0, 0, 1, 1, 2, 2, 3, 4, 5];

//   expect(
//     await sflow([req1, req2, req3])
//       .through(mergeStreamsByAscend((x: number) => x)) // merge all flows into one by ascend order
//       .toArray()
//   ).toEqual(ret);
// });

it("merge desc by invert use of asc", async () => {
  const req1 = sflow([0, 1, 2].toReversed());
  const req2 = sflow([1, 2, 3].toReversed());
  const req3 = sflow([0, 4, 5].toReversed());
  const ret = [0, 0, 1, 1, 2, 2, 3, 4, 5].toReversed();

  expect(
    await sflow(mergeStreamsByAscend((x) => -x, [req1, req2, req3]))
      // .peek(console.log)
      .toArray(),
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
      .toArray(),
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
    await sflow(mergeStreamsByAscend((x) => x, [req1, req2, req3]))
      // .peek(console.log)
      .toArray(),
  ).toEqual(ret); // cost about 60ms in my machine
});

it("not throws asc", async () => {
  const req1 = sflow([1, 2, 3]);
  const req2 = sflow([0, 4, 5]);
  expect(
    await sflow(mergeStreamsByAscend((x) => x, [req1, req2]))
      // .peek(console.log)
      .toArray(),
  ).toEqual([0, 1, 2, 3, 4, 5]);
});

it("throws not asc", async () => {
  const req1 = sflow([1, 2, 0]); // not asc
  const req2 = sflow([0, 4, 5]);
  expect(() =>
    sflow(mergeStreamsByAscend((x) => x, [req1, req2]))
      // .peek(console.log)
      .toArray(),
  ).toThrow(/ascending/);
});
