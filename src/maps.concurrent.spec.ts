import { it, expect } from "bun:test";
import { maps } from "./maps";
import { sflow } from "./sflow";

it("concurrent maps processes with concurrency > 1", async () => {
  const result = await sflow([1, 2, 3, 4])
    .map((x) => x * 2, { concurrency: 2 })
    .toArray();
  expect(result).toEqual([2, 4, 6, 8]);
});

it("concurrent maps with async fn", async () => {
  const result = await sflow([1, 2, 3, 4])
    .map(async (x) => x * 3, { concurrency: 2 })
    .toArray();
  expect(result).toEqual([3, 6, 9, 12]);
});

it("concurrent maps flushes remaining items", async () => {
  // With concurrency=3 and 5 items, the 4th and 5th are flushed
  const result = await sflow([1, 2, 3, 4, 5])
    .map(async (x) => x + 10, { concurrency: 3 })
    .toArray();
  expect(result).toEqual([11, 12, 13, 14, 15]);
});

it("concurrent maps provides index", async () => {
  const result = await sflow([10, 20, 30])
    .map((x: number, i: number) => `${x}-${i}`, { concurrency: 2 })
    .toArray();
  expect(result).toEqual(["10-0", "20-1", "30-2"]);
});

it("concurrent maps via sflow map with concurrency option", async () => {
  const result = await sflow([1, 2, 3, 4])
    .map((x) => x * 5, { concurrency: 4 })
    .toArray();
  expect(result).toEqual([5, 10, 15, 20]);
});

it("maps concurrent directly using TransformStream reader/writer", async () => {
  const ts = maps((x: number) => x * 2, { concurrency: 2 });
  const writer = ts.writable.getWriter();
  const reader = ts.readable.getReader();

  writer.write(1);
  writer.write(2);
  writer.write(3);
  writer.write(4);
  writer.close();

  const results: number[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    results.push(value);
  }
  expect(results).toEqual([2, 4, 6, 8]);
});
