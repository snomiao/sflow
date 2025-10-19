import { sflow } from "./sf";
import { sleep } from "./utils";

it("Confluence Streams Basic", async () => {
  const f0 = () => sflow([0]);
  const f1 = () => sflow([1, 3, 5]);
  const f2 = () => sflow([2, 4, 6]);
  const f3 = () => sflow([7, 8, 9, 10]);
  const f = () => sflow([f0(), f1(), f2(), f3()]);
  expect(await f().confluenceByZip().toArray()).toEqual([
    0, 1, 2, 7, 3, 4, 8, 5, 6, 9, 10,
  ]);
  expect(await f().confluenceByConcat().toArray()).toEqual([
    0, 1, 3, 5, 2, 4, 6, 7, 8, 9, 10,
  ]);
  expect(await f().confluenceByParallel().toArray()).toEqual([
    0, 1, 2, 7, 3, 4, 8, 5, 6, 9, 10,
  ]);
  expect(
    await f()
      .confluenceByAscend((x) => x + 1)
      .toArray(),
  ).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  expect(
    await f()
      .confluenceByDescend((x) => -x)
      .toArray(),
  ).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

describe("Confluence Streams With reversed delay", async () => {
  const reversedDelay = async (e: number): Promise<void> => {
    const delay = 10 * (10 - e);
    await sleep(delay);
  };
  const f0 = () => sflow([0]).forEach(reversedDelay); // delays 100ms
  const f1 = () => sflow([1, 3, 5]).forEach(reversedDelay); // delays 90+70+50=210 ms, slowest emit number 5
  const f2 = () => sflow([2, 4, 6]).forEach(reversedDelay); // delays 80+60+40=180 ms
  const f3 = () => sflow([7, 8, 9, 10]).forEach(reversedDelay); // delays 30+20+10+0=60 ms
  const f = () => sflow([f0(), f1(), f2(), f3()]);

  // ordered stream is no effected by delay
  it("ordered confluence is no effected by delay", async () => {
    expect(await f().confluenceByZip().toArray()).toEqual([
      0, 1, 2, 7, 3, 4, 8, 5, 6, 9, 10,
    ]);
    expect(await f().confluenceByConcat().toArray()).toEqual([
      0, 1, 3, 5, 2, 4, 6, 7, 8, 9, 10,
    ]);
    expect(
      await f()
        .confluenceByAscend((x) => x + 1)
        .toArray(),
    ).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(
      await f()
        .confluenceByDescend((x) => -x)
        .toArray(),
    ).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  //
  it("parallel confluence is effected by delay", async () => {
    expect(await f().confluenceByParallel().toArray()).not.toEqual([
      0, 1, 2, 7, 3, 4, 8, 5, 6, 9, 10,
    ]);
    const ret = await f().confluenceByParallel().toArray();
    expect(ret[0]).toEqual(7); // delays 30ms,
    expect(ret.toReversed()[0]).toEqual(5); // delays 80+70+50ms, slowest emit number 5
  });
});
