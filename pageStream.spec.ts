import { expectTypeOf } from "expect-type";
import Keyv from "keyv";
import { KeyvCachedWith } from "keyv-cached-with";
import sflow, { pageStream } from "./";
import { cacheTails } from "./caches";
it("works with number", async () => {
  expect(await sflow(
    pageStream(0, (page: number) => {
      expectTypeOf(page).toBeNumber();
      const data = [1, 2, 3, 4, 5][page];
      return {
        data,
        next: (!!data && page + 1) || null,
      };
    })
  )
    .map((e) => e)
    .toArray()).toEqual([1, 2, 3, 4, 5]);
});
it("works with cache with wrapper", async () => {
  const cache1d = KeyvCachedWith(new Keyv<unknown>({ ttl: 86400e3 }));
  expect(await sflow(
    pageStream(0, (page: number) => {
      expectTypeOf(page).toBeNumber();
      return cache1d((page) => {
        const data = [1, 2, 3, 4][page] as number | undefined;
        // expectTypeOf(page).toBeNumber(); // fail
        return { data, next: (!!data && page + 1) || null };
      }, page);
    })
  )
    .map((e) => e)
    .filter()
    .map((e) => e)
    .toArray()).toEqual([1, 2, 3, 4])
});
it("works with cache without wrapper", async () => {
  const cache1d = KeyvCachedWith(new Keyv<unknown>({ ttl: 86400e3 }));
  expect(await sflow(
    pageStream(
      0,
      cache1d((page: number) => {
        const data = [1, 2, 3, 4][page] as number | undefined;
        // expectTypeOf(page).toBeNumber(); // fail
        return { data, next: (!!data && page + 1) || null };
      })
    )
  )
    .map((e) => e)
    .filter()
    .map((e) => e)
    .toArray()).toEqual([1, 2, 3, 4]);
});

it("works with cacheTails", async () => {
  const store = (new Keyv<number[]>({ ttl: 86400e3 }));
  expect(await sflow(
    pageStream(
      0,
      ((page: number) => {
        const data = [5, 4, 3, 2, 1][page] as number | undefined;
        // expectTypeOf(page).toBeNumber(); // fail
        return { data, next: (!!data && page + 1) || null };
      })
    )
  ).filter().by(cacheTails(store, 'page'))
    .toArray()).toEqual([5, 4, 3, 2, 1]);
  expect(await sflow(
    pageStream(
      0,
      ((page: number) => {
        const data = [5][page] as number | undefined;
        // expectTypeOf(page).toBeNumber(); // fail
        return { data, next: (!!data && page + 1) || null };
      })
    )
  ).filter().by(cacheTails(store, 'page'))
    .toArray()).toEqual([5, 4, 3, 2, 1]);
});
