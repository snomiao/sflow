import { sflow } from "./index";
import { sleep } from "./utils";

describe.skip("throttles", () => {
  // todo: check this issue
  // - [Implement `test.concurrent` · Issue #5585 · oven-sh/bun]( https://github.com/oven-sh/bun/issues/5585 )
  it("works with drop", async () => {
    // emit: 0, 50, 100, 150
    // pass: 0, __, 100, ___
    expect(
      await sflow([1, 2, 3, 4])
        .forEach(async () => {
          await sleep(50);
        })
        .throttle(80, { drop: true, keepLast: false })
        .toArray(),
    ).toEqual([1, 3]);
  });
  it("works with drop keep last", async () => {
    const r = await sflow([1, 2, 3, 4])
      .forEach(async () => {
        await sleep(50);
      })
      .throttle(80, { drop: true, keepLast: true })
      .toArray();
    // emit: 0, 50, 100, 150
    // pass: 0, __, 100, ___
    // pass: 0, __, 100, ___, 180(150) send last item
    console.log(r);
    expect(r).toEqual([1, 3, 4]);
  });
  it("works without drop", async () => {
    // emit: 0, 50, 100, 150
    // pass: 0, __, 100, ___
    expect(
      await sflow([1, 2, 3, 4])
        .forEach(async () => {
          await sleep(50);
        })
        .throttle(80)
        .toArray(),
    ).toEqual([1, 2, 3, 4]);
  });
  it("works correct interval", async () => {
    // emit: 0, 50, 100, 150
    // pass: 0, __, 100, ___
    await sflow([1, 2, 3, 4])
      .forEach(async () => {
        await sleep(20);
      })
      .throttle(80)
      // calculate interval
      .map(() => Date.now())
      .convolve(2)
      .forEach(([a, b]) => {
        const interval = b - a;
        expect(Math.abs(interval - 80)).toBeLessThan(10);
      })
      .done();
  });
  it("works keep last", async () => {
    const r = await sflow([1, 2, 3, 4])
      .forEach(async () => {
        await sleep(50);
      })
      .throttle(80)
      .toArray();
    // emit: 0, 50, 100, 150
    // pass: 0, __, 100, ___
    // pass: 0, __, 100, ___, 180(150) send last item
    console.log(r);
    expect(r).toEqual([1, 2, 3, 4]);
  });
  it("works", async () => {
    expect(
      await sflow([1, 2, 3, 4])
        .forEach(async () => {
          await sleep(100);
        })
        .forEach(async () => {
          await sleep(100);
        })
        .log()
        .toArray(),
    ).toEqual([1, 2, 3, 4]);
  });

  it("interval should be 80", async () => {
    await sflow([1, 2, 3, 4])
      .forEach(async () => {
        await sleep(80);
      })
      // .forEach(() => sleep(80))
      // calculate interval
      .map(() => Date.now())
      .convolve(2)
      .forEach(([a, b]) => {
        const interval = b - a;
        expect(interval).toBeGreaterThan(60);
        expect(interval).toBeLessThan(100);
        expect(Math.abs(interval - 80)).toBeLessThan(20);
      })
      .done();
  });
  it("interval should still be 80 with double peek", async () => {
    await sflow([1, 2, 3, 4])
      .peek(() => sleep(200))
      .peek(() => sleep(200))
      // calculate interval
      .map(() => Date.now())
      .convolve(2)
      .forEach(([a, b]) => {
        const interval = b - a;
        console.log(interval);
        expect(Math.abs(interval - 200)).toBeLessThan(40); // todo: optimize
      })
      .done();
  });
});
