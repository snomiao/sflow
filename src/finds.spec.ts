import { describe, expect, it } from "vitest";
import { sflow } from "./sflow";

describe("finds", () => {
  it("should find the first matching element and stop the stream", async () => {
    const result = await sflow([1, 2, 3, 4, 5])
      .find((x) => x > 2)
      .toArray();

    expect(result).toEqual([3]);
  });

  it("should work with async predicate", async () => {
    const result = await sflow([1, 2, 3, 4, 5])
      .find(async (x) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        return x % 2 === 0;
      })
      .toArray();

    expect(result).toEqual([2]);
  });

  it("should return empty array if no match found", async () => {
    const result = await sflow([1, 3, 5])
      .find((x) => x % 2 === 0)
      .toArray();

    expect(result).toEqual([]);
  });

  it("should pass index to predicate", async () => {
    const indices: number[] = [];
    const result = await sflow(["a", "b", "c", "d"])
      .find((x, i) => {
        indices.push(i);
        return x === "c";
      })
      .toArray();

    expect(result).toEqual(["c"]);
    expect(indices).toEqual([0, 1, 2]); // Should stop after finding 'c' at index 2
  });

  it("should work with strings", async () => {
    const result = await sflow(["apple", "banana", "cherry", "date"])
      .find((fruit) => fruit.startsWith("c"))
      .toArray();

    expect(result).toEqual(["cherry"]);
  });

  it("should work with objects", async () => {
    const users = [
      { id: 1, name: "Alice", age: 30 },
      { id: 2, name: "Bob", age: 25 },
      { id: 3, name: "Charlie", age: 35 },
    ];

    const result = await sflow(users)
      .find((user) => user.age > 30)
      .toArray();

    expect(result).toEqual([{ id: 3, name: "Charlie", age: 35 }]);
  });

  it("should terminate stream early to prevent unnecessary processing", async () => {
    let processedCount = 0;
    const result = await sflow([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .map((x) => {
        processedCount++;
        return x;
      })
      .find((x) => x === 3)
      .toArray();

    expect(result).toEqual([3]);
    expect(processedCount).toBe(3); // Should only process up to the found element
  });

  it("toFirstMatch should return first matching item", async () => {
    const result = await sflow([1, 2, 3, 4, 5]).toFirstMatch((x) => x > 2);

    expect(result).toBe(3);
  });

  it("toFirstMatch should return undefined if no match found", async () => {
    const result = await sflow([1, 3, 5]).toFirstMatch((x) => x % 2 === 0);

    expect(result).toBeUndefined();
  });

  it("toFirstMatch should work with async predicate", async () => {
    const result = await sflow(["apple", "banana", "cherry"]).toFirstMatch(
      async (fruit) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        return fruit.startsWith("c");
      },
    );

    expect(result).toBe("cherry");
  });
});
