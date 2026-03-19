import { it, expect } from "bun:test";
import { forEachs } from "./forEachs";
import { sflow } from "./sflow";

it("sequential forEach passes items through unchanged", async () => {
  const seen: number[] = [];
  const result = await sflow([1, 2, 3])
    .forEach((x) => { seen.push(x); })
    .toArray();
  expect(result).toEqual([1, 2, 3]);
  expect(seen).toEqual([1, 2, 3]);
});

it("sequential forEach with async fn", async () => {
  const seen: number[] = [];
  const result = await sflow([1, 2, 3])
    .forEach(async (x) => { seen.push(x); })
    .toArray();
  expect(result).toEqual([1, 2, 3]);
  expect(seen).toEqual([1, 2, 3]);
});

it("sequential forEach provides index", async () => {
  const indices: number[] = [];
  await sflow([10, 20, 30])
    .forEach((_x, i) => { indices.push(i); })
    .toArray();
  expect(indices).toEqual([0, 1, 2]);
});

it("concurrent forEach processes items with concurrency > 1", async () => {
  const seen: number[] = [];
  const result = await sflow([1, 2, 3, 4])
    .forEach((x) => { seen.push(x); }, { concurrency: 2 })
    .toArray();
  expect(result).toEqual([1, 2, 3, 4]);
  expect(seen.sort()).toEqual([1, 2, 3, 4]);
});

it("concurrent forEach with async fn", async () => {
  const seen: number[] = [];
  const result = await sflow([1, 2, 3, 4])
    .forEach(async (x) => { seen.push(x); }, { concurrency: 2 })
    .toArray();
  expect(result).toEqual([1, 2, 3, 4]);
});

it("concurrent forEach flushes remaining items", async () => {
  // With concurrency=3 and 4 items, flush handles the last item
  const result = await sflow([1, 2, 3, 4])
    .forEach(async (_x) => {}, { concurrency: 3 })
    .toArray();
  expect(result).toEqual([1, 2, 3, 4]);
});

it("works via sflow forEach method", async () => {
  const log: number[] = [];
  const result = await sflow([1, 2, 3])
    .forEach((x) => { log.push(x); })
    .toArray();
  expect(result).toEqual([1, 2, 3]);
  expect(log).toEqual([1, 2, 3]);
});

it("concurrent forEach with concurrency matching item count", async () => {
  const result = await sflow([1, 2, 3])
    .forEach(async (_x) => {}, { concurrency: 3 })
    .toArray();
  expect(result).toEqual([1, 2, 3]);
});

it("forEachs directly with reader/writer - sequential", async () => {
  const ts = forEachs<number>((x) => { void x; });
  const writer = ts.writable.getWriter();
  const reader = ts.readable.getReader();

  writer.write(1);
  writer.write(2);
  writer.close();

  const results: number[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    results.push(value);
  }
  expect(results).toEqual([1, 2]);
});

it("forEachs directly with reader/writer - concurrent", async () => {
  const ts = forEachs<number>((x) => { void x; }, { concurrency: 2 });
  const writer = ts.writable.getWriter();
  const reader = ts.readable.getReader();

  writer.write(10);
  writer.write(20);
  writer.write(30);
  writer.close();

  const results: number[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    results.push(value);
  }
  expect(results).toEqual([10, 20, 30]);
});
