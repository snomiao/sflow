import { sleep } from "bun";
import Keyv from "keyv";
import { cacheLists, cacheTails } from "./caches";
import { sf } from "./index";

it("caches stream", async () => {
  const store = new Keyv<any>({ ttl: 10e3 });
  const heavyFlow = () => sf([1, 2, 3, 4]).forEach(() => sleep(10));
  const fn0 = jest.fn();
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  // slow without cache
  expect(await heavyFlow().forEach(fn0).toArray()).toEqual([1, 2, 3, 4]);
  expect(fn0).toHaveBeenCalledTimes(4);

  // slow with cache miss
  expect(
    await heavyFlow().forEach(fn1).by(cacheLists(store, "heavy-step")).toArray()
  ).toEqual([1, 2, 3, 4]);
  expect(fn1).toHaveBeenCalledTimes(4);

  // fast with cache hit
  expect(
    await heavyFlow().forEach(fn2).by(cacheLists(store, "heavy-step")).toArray()
  ).toEqual([1, 2, 3, 4]);
  expect(fn2).toHaveBeenCalledTimes(1); // should be 0 but error leaks
});

it("caches stream tail", async () => {
  const store = new Keyv<any>({ ttl: 10e3 });
  const heavyFlowHead1 = () => sf([3, 2, 1]);
  const heavyFlowHead2 = () => sf([5, 4, 3, 2, 1]);
  const heavyFlowHead3 = () => sf([5, 4, 3, 2, 1]);
  const heavyFlowHead = () => sf([6]);
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  const fn3 = jest.fn();
  const fn4 = jest.fn();
  const fn6 = jest.fn();

  // 1st time, we got page emit 3,2,1, cache [3,2,1]
  await heavyFlowHead1().forEach(fn2).by(cacheTails(store, "page")).toArray()
  expect(fn2).toHaveBeenCalledTimes(3);
  expect(await store.get('page')).toEqual([3, 2, 1])

  // 2th time, new element appeared 5,4,3
  // flow emit 5,4,3,2,1, hit cache from [2,], store [5,4,3]+[2,1] => [5,4,3,2,1]
  // fn will run at 5,4,3,2
  // Upstream terminates after 1 item emitted
  await heavyFlowHead2().forEach(fn3).by(cacheTails(store, "page")).toArray()
  expect(await store.get('page')).toEqual([5, 4, 3, 2, 1])
  expect(fn3).toHaveBeenCalledTimes(2 + 2);

  // 3th time, page content is not changed
  // flow emit 4,3,2,1, hit cache from [4,], store [4,3,2,1] => [4,3,2,1]
  // Upstream terminates after 1 item emitted
  await heavyFlowHead3().forEach(fn1).by(cacheTails(store, "page")).toArray()
  expect(fn1).toHaveBeenCalledTimes(2);
  expect(await store.get('page')).toEqual([5, 4, 3, 2, 1])

});
