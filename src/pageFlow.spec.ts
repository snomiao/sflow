import { expectTypeOf } from "expect-type";
import Keyv from "keyv";
import { KeyvCachedWith } from "keyv-cached-with";
import { pageFlow } from "./index";

it("works with number", async () => {
  await pageFlow(0, (page) => {
    expectTypeOf(page).toBeNumber();
    const data = [1, 2, 3, 4, 5][page];
    return {
      data,
      next: (!!data && page + 1) || null,
    };
  })
    .map((e) => e)
    .done();
});
it("works with cache", async () => {
  const cache1d = KeyvCachedWith(new Keyv<unknown>({ ttl: 86400e3 }));
  await pageFlow(
    0,
    cache1d(
      async (page: number): Promise<{ data: number; next: number | null }> => {
        const data = [1, 2, 3, 4, 5][page];
        expectTypeOf(page).toBeNumber();
        expectTypeOf(data).toBeNumber();
        return {
          data,
          next: (!!data && page + 1) || null,
        };
      },
    ),
  )
    .map((e) => e)
    .done();
});
