import Keyv from "keyv";
import { cacheLists } from "./cacheLists";
import { cacheTails } from "./cacheTails";
import sflow, { forEachs } from "./index";
import { sleep } from "./utils";

it("caches stream", async () => {
  const store = new Keyv<any>({ ttl: 10e3 });
  const heavyFlow = () => sflow([1, 2, 3, 4]);
  const fn0 = jest.fn();
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  // slow without cache
  expect(await heavyFlow().forEach(fn0).toArray()).toEqual([1, 2, 3, 4]);
  expect(fn0).toHaveBeenCalledTimes(4);

  // slow with cache miss
  expect(
    await heavyFlow()
      .by(forEachs(fn1))
      .byLazy(cacheLists(store, "heavy-step"))
      .toArray(),
  ).toEqual([1, 2, 3, 4]);
  expect(fn1).toHaveBeenCalledTimes(4);
  expect(await store.get("heavy-step")).toEqual([1, 2, 3, 4]);

  // fast with cache hit
  expect(
    await heavyFlow()
      .by(forEachs(fn2))
      .byLazy(cacheLists(store, "heavy-step"))
      .toArray(),
  ).toEqual([1, 2, 3, 4]);
  expect(fn2).toHaveBeenCalledTimes(1);
  await sleep(100);
  expect(fn2).toHaveBeenCalledTimes(1);
});

it("caches stream tail", async () => {
  const store = new Keyv<any>({ ttl: 10e3 });
  const heavyFlowHead1 = () => sflow([3, 2, 1]);
  const _heavyFlowHead2 = () => sflow([5, 4, 3, 2, 1]);
  const _heavyFlowHead3 = () => sflow([5, 4, 3, 2, 1]);
  const _heavyFlowHead = () => sflow([6]);
  const _fn1 = jest.fn();
  const fn2 = jest.fn();
  const _fn3 = jest.fn();
  const _fn4 = jest.fn();
  const _fn6 = jest.fn();

  // 1st time, we got page emit 3,2,1, cache [3,2,1]
  await heavyFlowHead1().forEach(fn2).by(cacheTails(store, "page")).toArray();
  expect(fn2).toHaveBeenCalledTimes(3);
  expect(await store.get("page")).toEqual([3, 2, 1]);

  // 2th time, new element appeared 5,4,3
  // flow emit 5,4,3,2,1, hit cache from [2,], store [5,4,3]+[2,1] => [5,4,3,2,1]
  // fn will run at 5,4,3,2
  // Upstream terminates after 1 item emitted
  // await heavyFlowHead2()
  //   .forEach(fn3)
  //   .byLazy(cacheTails(store, "page"))
  //   .toArray();
  // expect(await store.get("page")).toEqual([5, 4, 3, 2, 1]);
  // await sleep(100);
  // expect(fn3).toHaveBeenCalledTimes(2 + 1);

  // // 3th time, page content is not changed
  // // flow emit 4,3,2,1, hit cache from [4,], store [4,3,2,1] => [4,3,2,1]
  // // Upstream terminates after 1 item emitted
  // await heavyFlowHead3()
  //   .forEach(fn1)
  //   .byLazy(cacheTails(store, "page"))
  //   .toArray();
  // await sleep(100);
  // expect(fn1).toHaveBeenCalledTimes(1);
  // expect(await store.get("page")).toEqual([5, 4, 3, 2, 1]);
});
