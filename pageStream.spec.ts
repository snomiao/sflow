import { expectTypeOf } from "expect-type";
import Keyv from "keyv";
import { KeyvCachedWith } from "keyv-cached-with";
import sflow, { pageStream } from "./";
it("works with number", async () => {
  await sflow(
    pageStream(0, (page) => {
      expectTypeOf(page).toBeNumber();
      const data = [1, 2, 3, 4, 5][page];
      return {
        data,
        next: (!!data && page + 1) || null,
      };
    })
  )
    .map((e) => e)
    .done();
});
it.skip("works with cache with wrapper", async () => {
  const cache1d = KeyvCachedWith(new Keyv<unknown>({ ttl: 86400e3 }));
  await sflow(
    pageStream(0, (page) => {
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
    .done();
});
it.skip("works with cache without wrapper", async () => {
  const cache1d = KeyvCachedWith(new Keyv<unknown>({ ttl: 86400e3 }));
  await sflow(
    pageStream(
      0,
      cache1d((page) => {
        const data = [1, 2, 3, 4][page] as number | undefined;
        // expectTypeOf(page).toBeNumber(); // fail
        return { data, next: (!!data && page + 1) || null };
      })
    )
  )
    .map((e) => e)
    .filter()
    .map((e) => e)
    .done();
});
