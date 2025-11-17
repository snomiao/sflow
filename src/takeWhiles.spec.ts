import { describe, expect, it } from "bun:test";
import { sflow } from "./sflow";

describe("takeWhile", () => {
  it("should take elements while predicate is true", async () => {
    const result = await sflow([1, 2, 3, 4, 5])
      .takeWhile((x) => x < 4)
      .toArray();
    expect(result).toEqual([1, 2, 3]);
  });

  it("should return empty array when first element fails predicate", async () => {
    const result = await sflow([1, 2, 3, 4, 5])
      .takeWhile((x) => x > 10)
      .toArray();
    expect(result).toEqual([]);
  });

  it("should take all elements when predicate is always true", async () => {
    const result = await sflow([1, 2, 3, 4, 5])
      .takeWhile((x) => x > 0)
      .toArray();
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it("should work with async predicate", async () => {
    const result = await sflow([1, 2, 3, 4, 5])
      .takeWhile(async (x) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        return x <= 3;
      })
      .toArray();
    expect(result).toEqual([1, 2, 3]);
  });

  it("should provide index to predicate function", async () => {
    const indices: number[] = [];
    await sflow(["a", "b", "c", "d"])
      .takeWhile((_, i) => {
        indices.push(i);
        return i < 2;
      })
      .toArray();
    expect(indices).toEqual([0, 1, 2]);
  });

  it("should work with terminate option disabled", async () => {
    const result = await sflow([1, 2, 3, 4, 5])
      .takeWhile((x) => x < 3, { terminate: false })
      .toArray();
    expect(result).toEqual([1, 2]);
  });

  it("should handle empty stream", async () => {
    const result = await sflow<number>([])
      .takeWhile((x) => x < 10)
      .toArray();
    expect(result).toEqual([]);
  });

  it("should work with object streams", async () => {
    const result = await sflow([
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 },
      { id: 4, value: 40 },
    ])
      .takeWhile((x) => x.value < 30)
      .toArray();
    expect(result).toEqual([
      { id: 1, value: 10 },
      { id: 2, value: 20 },
    ]);
  });
});
