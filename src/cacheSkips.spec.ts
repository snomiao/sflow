import Keyv from "keyv";
import { sf } from ".";
import { cacheSkips } from "./cacheSkips";
it("works", async () => {
  const kv = new Keyv<any>({ ttl: 10e3 });
  expect(await sf([4, 3, 2, 1]).by(cacheSkips(kv, "test")).toArray()).toEqual([
    4, 3, 2, 1,
  ]);
  expect(
    await sf([5, 4, 3, 2, 1]).by(cacheSkips(kv, "test")).toArray()
  ).toEqual([5]);
});

it("works on obj", async () => {
  const kv = new Keyv<any>({ ttl: 10e3 });
  expect(
    await sf([4, 3, 2, 1])
      .map((e) => ({ e }))
      .by(cacheSkips(kv, "test"))
      .map(({ e }) => e)
      .toArray()
  ).toEqual([4, 3, 2, 1]);
  expect(
    await sf([5, 4, 3, 2, 1])
      .map((e) => ({ e }))
      .by(cacheSkips(kv, "test"))
      .map(({ e }) => e)
      .toArray()
  ).toEqual([5]);
  expect(
    await sf([6, 5, 4, 3, 2, 1])
      .map((e) => ({ e }))
      .by(cacheSkips(kv, "test"))
      .map(({ e }) => e)
      .toArray()
  ).toEqual([6]);
});

it("works on Date", async () => {
  const kv = new Keyv<any>({ ttl: 10e3 });
  expect(
    await sf([4, 3, 2, 1])
      .map((e) => ({ date: new Date(e) }))
      .by(cacheSkips(kv, "test"))
      .map(({ date }) => +date)
      .toArray()
  ).toEqual([4, 3, 2, 1]);
  expect(await kv.get("test")).toEqual([{ date: new Date(4).toISOString() }]);
  expect(
    await sf([6, 5, 4, 3, 2, 1])
      .map((e) => ({ date: new Date(e) }))
      .by(cacheSkips(kv, "test"))
      .map(({ date }) => +date)
      .toArray()
  ).toEqual([6, 5]);
  expect(await kv.get("test")).toEqual([{ date: new Date(6).toISOString() }]);
  expect(
    await sf([8, 7, 6, 5, 4, 3, 2, 1])
      .map((e) => ({ date: new Date(e) }))
      .by(cacheSkips(kv, "test"))
      .map(({ date }) => +date)
      .toArray()
  ).toEqual([8, 7]);
});
