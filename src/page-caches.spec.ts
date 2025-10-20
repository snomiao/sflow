import Keyv from "keyv";
import type { cacheTails } from "./cacheTails";
import { logs, maps, pageFlow } from "./index";
import { sleep } from "./utils";

it.skip("page caches stream", async () => {
  const pageData1 = [
    [4, 3],
    [2, 1],
  ];

  const store = new Keyv<any>() as unknown as Parameters<typeof cacheTails>[0];
  const fetcher1 = jest.fn((page) => pageData1[page]);
  const ret1 = await pageFlow(0, (page: number) => {
    const data = fetcher1(page);
    return { data, next: data ? page + 1 : null };
  })
    .flat()
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    // @ts-expect-error - store type mismatch in test
    .cacheTail(store, "cache")
    .log()
    .toArray();
  expect(ret1).toEqual([4, 3, 2, 1]);
  expect(fetcher1).toHaveBeenCalledTimes(3);

  const pageData2 = [
    [6, 5],
    [4, 3],
    [2, 1],
  ];
  const fetcher2 = jest.fn((page) => pageData2[page]);
  const ret2 = await pageFlow(0, (page: number) => {
    const data = fetcher2(page);
    return { data, next: data ? page + 1 : null };
  })
    .flat()
    .byLazy(logs((e) => `head data: ${e}`))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    .byLazy(maps(async (e) => (await sleep(10), e)))
    // @ts-expect-error - store type mismatch in test
    .cacheTail(store, "cache")
    .log()
    .toArray();
  expect(ret2).toEqual([6, 5, 4, 3, 2, 1]);
  expect(fetcher2).toHaveBeenCalledTimes(2); // [6,5],
  console.log("done");
});
