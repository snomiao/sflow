import { it, expect } from "bun:test";
import { parallels } from "./parallels";
import { sflow } from "./sflow";

it("parallels merges multiple readable streams", async () => {
  const s1 = new ReadableStream<number>({
    start(ctrl) { ctrl.enqueue(1); ctrl.enqueue(2); ctrl.close(); },
  });
  const s2 = new ReadableStream<number>({
    start(ctrl) { ctrl.enqueue(3); ctrl.enqueue(4); ctrl.close(); },
  });
  const result = await sflow(parallels(s1, s2)).toArray();
  expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
});

it("parallels with single stream passes through items", async () => {
  const s1 = new ReadableStream<number>({
    start(ctrl) { ctrl.enqueue(10); ctrl.enqueue(20); ctrl.close(); },
  });
  const result = await sflow(parallels(s1)).toArray();
  expect(result).toEqual([10, 20]);
});

it("parallels with three streams", async () => {
  const s1 = new ReadableStream<number>({ start: (c) => { c.enqueue(1); c.close(); } });
  const s2 = new ReadableStream<number>({ start: (c) => { c.enqueue(2); c.close(); } });
  const s3 = new ReadableStream<number>({ start: (c) => { c.enqueue(3); c.close(); } });
  const result = await sflow(parallels(s1, s2, s3)).toArray();
  expect(result.sort()).toEqual([1, 2, 3]);
});
