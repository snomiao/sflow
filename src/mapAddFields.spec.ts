import { it, expect } from "bun:test";
import { mapAddFields } from "./mapAddFields";
import { sflow } from "./sflow";

it("adds a field to each object synchronously", async () => {
  const result = await sflow([{ name: "Alice" }, { name: "Bob" }])
    .mapAddField("upper", (x) => x.name.toUpperCase())
    .toArray();
  expect(result).toEqual([
    { name: "Alice", upper: "ALICE" },
    { name: "Bob", upper: "BOB" },
  ]);
});

it("adds a field asynchronously", async () => {
  const result = await sflow([{ id: 1 }, { id: 2 }])
    .mapAddField("doubled", async (x) => x.id * 2)
    .toArray();
  expect(result).toEqual([
    { id: 1, doubled: 2 },
    { id: 2, doubled: 4 },
  ]);
});

it("provides index to the mapping function", async () => {
  const result = await sflow([{ v: "a" }, { v: "b" }, { v: "c" }])
    .mapAddField("idx", (_x, i) => i)
    .toArray();
  expect(result).toEqual([
    { v: "a", idx: 0 },
    { v: "b", idx: 1 },
    { v: "c", idx: 2 },
  ]);
});

it("works via sflow mapAddField method", async () => {
  const result = await sflow([{ x: 10 }, { x: 20 }])
    .mapAddField("y", (item) => item.x + 1)
    .toArray();
  expect(result).toEqual([
    { x: 10, y: 11 },
    { x: 20, y: 21 },
  ]);
});

it("overwrites existing field with new key", async () => {
  const result = await sflow([{ name: "Alice", score: 5 }])
    .mapAddField("score", (x) => x.score * 2)
    .toArray();
  expect(result).toEqual([{ name: "Alice", score: 10 }]);
});

it("mapAddFields directly with reader/writer", async () => {
  const ts = mapAddFields("tag", (x: { n: number }) => `item-${x.n}`);
  const writer = ts.writable.getWriter();
  const reader = ts.readable.getReader();

  writer.write({ n: 1 });
  writer.write({ n: 2 });
  writer.close();

  const results = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    results.push(value);
  }
  expect(results).toEqual([{ n: 1, tag: "item-1" }, { n: 2, tag: "item-2" }]);
});
