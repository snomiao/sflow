import { it, expect } from "bun:test";
import { emptyStream } from "./emptyStream";
import { sflow } from "./sflow";

it("emptyStream produces no items", async () => {
  const result = await sflow(emptyStream()).toArray();
  expect(result).toEqual([]);
});

it("emptyStream closes immediately", async () => {
  const s = emptyStream();
  const reader = s.getReader();
  const { done } = await reader.read();
  expect(done).toBe(true);
});
