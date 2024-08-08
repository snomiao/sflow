import type { AnyFunction } from "ts-essentials";
import { flats } from "./flats";
import { sflow } from "./sflow";

it("works", async () => {
  let i = 0;
  const rs = new ReadableStream<number[]>(
    {
      pull: (ctrl) => {
        console.log("pull st " + i);
        ctrl.enqueue([i, i + 1]);
        ++i < 2 || ctrl.close();
      },
    },
    { highWaterMark: 0 }
  );

  expect(await sflow(rs).flat().log().toArray()).toEqual([0, 1, 1, 2]);
});

const lazyStream = (fn: AnyFunction, i = 0) =>
  new ReadableStream<number[]>(
    {
      pull: (ctrl) => {
        fn();
        const dat = [i, i + 1];
        ctrl.enqueue(dat);
        console.log("pull st " + dat);
        ++i < 5 || ctrl.close();
      },
    },
    { highWaterMark: 0 }
  );

it("ensure lazy read", async () => {
  const fn0 = jest.fn();
  expect(fn0).toHaveBeenCalledTimes(0);
  expect(
    await sflow(lazyStream(fn0)).byLazy(flats()).limit(2).toArray()
  ).toEqual([0, 1]);
  expect(fn0).toHaveBeenCalledTimes(1);

  const fn1 = jest.fn();
  expect(
    await sflow(lazyStream(fn1)).byLazy(flats()).limit(3).toArray()
  ).toEqual([0, 1, 1]);
  expect(fn1).toHaveBeenCalledTimes(2);
});
