import { it, expect } from "bun:test";
import { merges } from "./merges";
import { sflow } from "./sflow";

it("merges upstream with additional sources", async () => {
  const ts = merges<number>([10, 20, 30]);
  const writer = ts.writable.getWriter();
  writer.write(1);
  writer.write(2);
  writer.close();

  const result = await sflow(ts.readable).toArray();
  expect(result.sort((a, b) => a - b)).toEqual([1, 2, 10, 20, 30]);
});

it("returns passthrough when no extra sources", async () => {
  const ts = merges<number>();
  const writer = ts.writable.getWriter();
  writer.write(5);
  writer.write(6);
  writer.close();

  const result = await sflow(ts.readable).toArray();
  expect(result).toEqual([5, 6]);
});

it("works via sflow merge method", async () => {
  const result = await sflow([1, 2, 3]).merge([4, 5, 6]).toArray();
  expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
});
