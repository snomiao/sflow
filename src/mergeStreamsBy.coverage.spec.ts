import { it, expect } from "bun:test";
import { mergeStreamsBy, mergeStreamsByDescend } from "./mergeStreamsBy";
import { sflow } from "./sflow";

it("mergeStreamsBy with curried form", async () => {
  // Test curried (no sources) form - covers the early return branch
  const merger = mergeStreamsBy<number>(async (slots, ctrl) => {
    const cands = slots.filter((s) => s?.done === false);
    if (!cands.length) { ctrl.close(); return []; }
    const slot = cands[0]!;
    ctrl.enqueue(slot.value!);
    const idx = slots.indexOf(slot);
    return [...slots.slice(0, idx), null, ...slots.slice(idx + 1)];
  });
  const result = await sflow(merger([sflow([1, 2]), sflow([3])])).toArray();
  expect(result.sort()).toEqual([1, 2, 3]);
});

it("mergeStreamsByDescend merges descending sorted streams", async () => {
  const s1 = sflow([5, 3, 1]);
  const s2 = sflow([6, 4, 2]);
  const result = await sflow(mergeStreamsByDescend((x) => x, [s1, s2])).toArray();
  expect(result).toEqual([6, 5, 4, 3, 2, 1]);
});

it("mergeStreamsByDescend curried form", async () => {
  const merger = mergeStreamsByDescend<number>((x) => x);
  const result = await sflow(merger([sflow([4, 2]), sflow([3, 1])])).toArray();
  expect(result).toEqual([4, 3, 2, 1]);
});

it("mergeStreamsByDescend throws when not in descending order", async () => {
  const s1 = sflow([1, 3]); // not descending
  const s2 = sflow([4, 2]);
  await expect(
    sflow(mergeStreamsByDescend((x) => x, [s1, s2])).toArray(),
  ).rejects.toThrow("descending");
});

it("mergeStreamsBy returns empty stream for empty sources array", async () => {
  const result = await sflow(mergeStreamsBy<number>(async (slots, ctrl) => {
    ctrl.close();
    return [];
  }, [])).toArray();
  expect(result).toEqual([]);
});
