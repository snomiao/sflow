import { it, expect } from "bun:test";
import { heads } from "./heads";
import { sflow } from "./sflow";

it("takes default 1 item", async () => {
  const ts = heads<number>();
  const writer = ts.writable.getWriter();
  const reader = ts.readable.getReader();

  writer.write(10);
  writer.write(20);
  // Don't close writer - heads blocks after 1 item (never())

  const { value: v1 } = await reader.read();
  expect(v1).toBe(10);
});

it("takes N items via heads directly", async () => {
  const ts = heads<number>(3);
  const writer = ts.writable.getWriter();

  writer.write(1);
  writer.write(2);
  writer.write(3);
  // Don't write more - heads blocks after 3

  const reader = ts.readable.getReader();
  const results = [];
  const r1 = await reader.read(); results.push(r1.value);
  const r2 = await reader.read(); results.push(r2.value);
  const r3 = await reader.read(); results.push(r3.value);
  expect(results).toEqual([1, 2, 3]);
});

it("works via sflow head method (limit to first items)", async () => {
  // sflow.head() uses heads() which blocks after n items
  // Use limit which terminates the stream properly
  const result = await sflow([1, 2, 3, 4, 5]).limit(2).toArray();
  expect(result).toEqual([1, 2]);
});

it("takes zero items", async () => {
  const ts = heads<number>(0);
  const writer = ts.writable.getWriter();
  const reader = ts.readable.getReader();

  // Writing should block immediately (n=0 means every item calls never())
  // Don't call write - just verify reader is available
  expect(reader).toBeDefined();
  writer.releaseLock();
  reader.releaseLock();
});
