import { it, expect } from "bun:test";
import { slices } from "./slices";
import { sflow } from "./sflow";

it("slices from start to end", async () => {
  const result = await sflow([1, 2, 3, 4, 5]).slice(1, 4).toArray();
  expect(result).toEqual([2, 3, 4]);
});

it("slices from start with default end (Infinity)", async () => {
  const result = await sflow([1, 2, 3, 4, 5]).slice(2).toArray();
  expect(result).toEqual([3, 4, 5]);
});

it("slices with default start (0) and end", async () => {
  const result = await sflow([1, 2, 3, 4, 5]).slice(0, 3).toArray();
  expect(result).toEqual([1, 2, 3]);
});

it("slices with both defaults returns all items", async () => {
  const result = await sflow([1, 2, 3]).slice().toArray();
  expect(result).toEqual([1, 2, 3]);
});

it("works via sflow slice method", async () => {
  const result = await sflow([10, 20, 30, 40, 50]).slice(1, 3).toArray();
  expect(result).toEqual([20, 30]);
});

it("slices beyond end returns remaining items", async () => {
  const result = await sflow([1, 2, 3]).slice(1, 10).toArray();
  expect(result).toEqual([2, 3]);
});

it("slices directly using reader/writer", async () => {
  const ts = slices<number>(1, 3);
  const writer = ts.writable.getWriter();
  const reader = ts.readable.getReader();

  writer.write(10);
  writer.write(20);
  writer.write(30);
  writer.write(40);
  writer.close();

  const results: number[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    results.push(value);
  }
  expect(results).toEqual([20, 30]);
});
