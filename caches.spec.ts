import { sleep } from "bun";
import Keyv from "keyv";
import { sf } from ".";
import { cacheLists } from "./caches";

it("caches stream", async () => {
  const store = new Keyv<any>({ ttl: 10e3 });
  const heavyFlow = () => sf([1, 2, 3, 4]).forEach(() => sleep(10));
  const fn0 = jest.fn();
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  // slow without cache
  console.log("slow without cache");
  expect(await heavyFlow().forEach(fn0).toArray()).toEqual([1, 2, 3, 4]);
  expect(fn0).toHaveBeenCalledTimes(4);

  // slow with cache miss
  console.log("slow with cache miss");
  expect(
    await heavyFlow().forEach(fn1).by(cacheLists(store, "heavy-step")).toArray()
  ).toEqual([1, 2, 3, 4]);
  expect(fn1).toHaveBeenCalledTimes(4);

  // fast with cache hit
  console.log("fast with cache hit");
  expect(
    await heavyFlow().forEach(fn2).by(cacheLists(store, "heavy-step")).toArray()
  ).toEqual([1, 2, 3, 4]);
  expect(fn2).toHaveBeenCalledTimes(1); // should be 0 but error leaks
});
