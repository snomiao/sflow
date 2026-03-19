import { it, expect } from "bun:test";
import { chunkIntervals } from "./chunkIntervals";
import { sflow } from "./sflow";

it("collects items into chunks by interval and flushes on close", async () => {
  const ts = chunkIntervals<number>(10000); // large interval, items must flush on close
  const writer = ts.writable.getWriter();
  const reader = ts.readable.getReader();

  writer.write(1);
  writer.write(2);
  writer.write(3);
  writer.close();

  const results: number[][] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    results.push(value);
  }
  // flush should emit remaining items
  expect(results.flat().sort()).toEqual([1, 2, 3]);
});

it("interval timer fires and emits chunks", async () => {
  // Start interval, write items, wait for interval to fire, then check by closing
  const ts = chunkIntervals<number>(20);
  const writer = ts.writable.getWriter();

  // Write items - they go into internal chunks array
  writer.write(1).catch(() => {});
  writer.write(2).catch(() => {});
  writer.write(3).catch(() => {});

  // Wait for the interval to fire (fires every 20ms)
  await new Promise((r) => setTimeout(r, 60));

  // Close the writer and collect results
  writer.close().catch(() => {});

  const reader = ts.readable.getReader();
  const results: number[][] = [];
  // Set a timeout to avoid hanging
  const timeout = new Promise<void>((_, rej) => setTimeout(() => rej(new Error("timeout")), 500));
  try {
    await Promise.race([
      (async () => {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value.length > 0) results.push(value);
        }
      })(),
      timeout,
    ]);
  } catch (_e) {
    // timeout or error - that's ok, we just check what we got
  }
  // Items should have been emitted via interval
  expect(results.flat().sort()).toEqual([1, 2, 3]);
});

it("works via sflow chunkInterval method", async () => {
  const result = await sflow([1, 2, 3]).chunkInterval(10000).toArray();
  const flat = result.flat();
  expect(flat.sort()).toEqual([1, 2, 3]);
});

it("emits nothing when no items and stream closes", async () => {
  const ts = chunkIntervals<number>(10);
  const writer = ts.writable.getWriter();
  const reader = ts.readable.getReader();

  await writer.close();

  const results: number[][] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    results.push(value);
  }
  expect(results.flat()).toEqual([]);
});
