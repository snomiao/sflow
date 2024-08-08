import Keyv from "keyv";
import { logs, pageFlow } from "./index";

it("caches stream", async () => {
  const pageData1 = [
    [4, 3],
    [2, 1],
  ];
  const pageData2 = [
    [6, 5],
    [4, 3],
    [2, 1],
  ];

  const store = new Keyv<any>();
  const fetcher1 = jest.fn((page) => pageData1[page]);
  const ret1 = await pageFlow(0, (page: number) => {
    const data = fetcher1(page);
    return { data, next: data ? page + 1 : null };
  })
    .flat()
    .cacheTail(store, "cache")
    .log()
    .toArray();
  expect(ret1).toEqual([4, 3, 2, 1]);
  expect(fetcher1).toHaveBeenCalledTimes(3);

  const fetcher2 = jest.fn((page) => pageData2[page]);
  const ret2 = await pageFlow(0, (page: number) => {
    const data = fetcher2(page);
    return { data, next: data ? page + 1 : null };
  })
    .flat()
    .byLazy(logs((e) => "head data: " + e))
    .cacheTail(store, "cache")
    .log()
    .toArray();
  expect(ret2).toEqual([6, 5, 4, 3, 2, 1]);
  expect(fetcher2).toHaveBeenCalledTimes(2); // [6,5],
  console.log("done");
});
