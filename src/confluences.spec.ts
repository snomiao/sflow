import { confluences } from "./confluences";
import { sflow } from "./sf";
import { sleep } from "./utils";

it("As stream kernel", async () => {
  const flow1 = sflow([1, 2, 3]);
  const flow2 = sflow([4, 5, 6]);
  expect(
    await sflow([flow1, flow2])
      .through((e) => e.pipeThrough(confluences()))
      .peek((e) => expect(typeof e === "number").toBeTruthy())
      .toArray(),
  ).toEqual([1, 4, 2, 5, 3, 6]);
});
it("As pipeline kernel", async () => {
  expect(
    await sflow([sflow([1, 2, 3]), sflow([4, 5, 6])])
      .through(confluences())
      .toArray(),
  ).toEqual([1, 4, 2, 5, 3, 6]);
});
it("As pipeline", async () => {
  expect(
    await sflow([sflow([1, 2, 3]), sflow([4, 5, 6])])
      .confluence()
      .toArray(),
  ).toEqual([1, 4, 2, 5, 3, 6]);
});
it("breadth first search", async () => {
  expect(
    await sflow([sflow([1, 2, 3]), sflow([4, 5, 6]), sflow([7, 8, 9])])
      .confluence()
      .toArray(),
  ).toEqual([1, 4, 7, 2, 5, 8, 3, 6, 9]);
});
it("works for different length flow", async () => {
  expect(
    await sflow([sflow([1]), sflow([4, 5]), sflow([7, 8, 9])])
      .confluence()
      .toArray(),
  ).toEqual([1, 4, 7, 5, 8, 9]);
});
it("drains correctly for different length flow", async () => {
  const f = [0, 1, 2, -1].map(() => jest.fn());
  const c = sflow([
    sflow([1]).onFlush(f[0]),
    sflow([4, 5]).onFlush(f[1]),
    sflow([7, 8, 9]).onFlush(f[2]),
  ])
    .confluence()
    .onFlush(f[3]);
  const r = c.getReader();

  await r.read(); // pulled from [0|1|2] got [1,4,7]  emit 1
  expect(f[0]).not.toHaveBeenCalled();
  await r.read(); // pulled from [0| | ] got [_,4,7]  emit 4
  expect(f[0]).toHaveBeenCalled();
  await r.read(); // pulled from [ |1| ] got [_,5,7]  emit 5
  await r.read(); // pulled from [ | |2] got [_,_,7]  emit 7
  expect(f[1]).not.toHaveBeenCalled();
  await r.read(); // pulled from [ | |2] got [_,_,8]  emit 8
  expect(f[1]).toHaveBeenCalled();
  await r.read(); // pulled from [ | |2] got [_,_,9]  emit 9
  expect(f[2]).not.toHaveBeenCalled();
  expect(f[3]).not.toHaveBeenCalled();
  await r.read(); // pulled from [ | |2] got [_,_,_]  drain
  expect(f[2]).toHaveBeenCalled();
  expect(f[3]).toHaveBeenCalled();
});
it("lazy read", async () => {
  const fn1 = jest.fn();
  const fn2 = jest.fn();

  const flow = sflow([
    sflow([1]).forEach(fn1),
    sflow([4, 5]).forEach(fn2),
    sflow([7, 8, 9]),
  ]);
  await sleep(10);
  expect(fn1).not.toHaveBeenCalled();
  expect(fn2).not.toHaveBeenCalled();
  console.log("conf");
  const conFlow = flow.confluence(); // will read only 1 src
  await sleep(10);
  expect(fn1).toHaveBeenCalled();
  expect(fn2).not.toHaveBeenCalled();

  console.log("conf2");
  const res = await conFlow.toArray();
  await sleep(10);
  expect(fn1).toHaveBeenCalled();
  expect(fn2).toHaveBeenCalled();

  expect(res).toEqual([1, 4, 7, 5, 8, 9]);
});
