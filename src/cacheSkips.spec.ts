import Keyv from "keyv";
import { cacheSkips } from "./cacheSkips";
import { sflow } from "./sf";

it("works", async () => {
  const kv = new Keyv<unknown>({ ttl: 10e3 }) as unknown as Parameters<
    typeof cacheSkips
  >[0];
  expect(
    await sflow([4, 3, 2, 1]).by(cacheSkips(kv, "test")).toArray(),
  ).toEqual([4, 3, 2, 1]);
  expect(
    await sflow([5, 4, 3, 2, 1]).by(cacheSkips(kv, "test")).toArray(),
  ).toEqual([5]);
});

it("works on obj", async () => {
  const kv = new Keyv<unknown>({ ttl: 10e3 }) as unknown as Parameters<
    typeof cacheSkips
  >[0];
  expect(
    await sflow([4, 3, 2, 1])
      .map((e) => ({ e }))
      .by(cacheSkips(kv, "test"))
      .map(({ e }) => e)
      .toArray(),
  ).toEqual([4, 3, 2, 1]);
  expect(
    await sflow([5, 4, 3, 2, 1])
      .map((e) => ({ e }))
      .by(cacheSkips(kv, "test"))
      .map(({ e }) => e)
      .toArray(),
  ).toEqual([5]);
  expect(
    await sflow([6, 5, 4, 3, 2, 1])
      .map((e) => ({ e }))
      .by(cacheSkips(kv, "test"))
      .map(({ e }) => e)
      .toArray(),
  ).toEqual([6]);
});

it("works on Date", async () => {
  const kv = new Keyv<unknown>({ ttl: 10e3 }) as unknown as Parameters<
    typeof cacheSkips
  >[0];
  expect(
    await sflow([4, 3, 2, 1])
      .map((e) => ({ date: new Date(e) }))
      .by(cacheSkips(kv, "test"))
      .map(({ date }) => +date)
      .toArray(),
  ).toEqual([4, 3, 2, 1]);
  expect(await kv.get("test")).toEqual([{ date: new Date(4).toISOString() }]);
  expect(
    await sflow([6, 5, 4, 3, 2, 1])
      .map((e) => ({ date: new Date(e) }))
      .by(cacheSkips(kv, "test"))
      .map(({ date }) => +date)
      .toArray(),
  ).toEqual([6, 5]);
  expect(await kv.get("test")).toEqual([{ date: new Date(6).toISOString() }]);
  expect(
    await sflow([8, 7, 6, 5, 4, 3, 2, 1])
      .map((e) => ({ date: new Date(e) }))
      .by(cacheSkips(kv, "test"))
      .map(({ date }) => +date)
      .toArray(),
  ).toEqual([8, 7]);
});
