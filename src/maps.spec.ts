import { expectTypeOf } from "expect-type";
import { maps } from "./maps";
import { sflow } from "./";

describe("maps function", () => {
  it("keeps type definitions", async () => {
    const ret = await sflow([1, 2, 3])
      .map((x) => x * 2)
      .map((x) => {
        expectTypeOf(x).toEqualTypeOf<number>();
        return x + 1;
      })
      .toArray();
    expectTypeOf(ret).toEqualTypeOf<number[]>();
    expect(ret).toEqual([3, 5, 7]);
  });
  it("transforms values synchronously", async () => {
    const transformStream = maps((x: number) => x * 2);
    const writer = transformStream.writable.getWriter();
    const reader = transformStream.readable.getReader();

    writer.write(1);
    writer.write(2);
    writer.write(3);
    writer.close();

    const results = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      results.push(value);
    }

    expect(results).toEqual([2, 4, 6]);
  });

  it("transforms values asynchronously", async () => {
    const transformStream = maps(async (x: number) => {
      return new Promise((resolve) => setTimeout(() => resolve(x * 2), 10));
    });
    const writer = transformStream.writable.getWriter();
    const reader = transformStream.readable.getReader();

    writer.write(1);
    writer.write(2);
    writer.write(3);
    writer.close();

    const results = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      results.push(value);
    }

    expect(results).toEqual([2, 4, 6]);
  });

  it("provides index to mapping function", async () => {
    const transformStream = maps((x: number, i: number) => `${x}-${i}`);
    const writer = transformStream.writable.getWriter();
    const reader = transformStream.readable.getReader();

    writer.write(10);
    writer.write(20);
    writer.write(30);
    writer.close();

    const results = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      results.push(value);
    }

    expect(results).toEqual(["10-0", "20-1", "30-2"]);
  });

  it("works with sflow pipeline", async () => {
    const result = await sflow([1, 2, 3, 4])
      .map((x) => x * 2)
      .toArray();

    expect(result).toEqual([2, 4, 6, 8]);
  });

  it("handles different input and output types", async () => {
    const result = await sflow(["1", "2", "3"])
      .map((x) => parseInt(x))
      .toArray();

    expect(result).toEqual([1, 2, 3]);
  });

  it("can transform objects", async () => {
    const users = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ];

    const result = await sflow(users)
      .map((user) => ({ ...user, active: true }))
      .toArray();

    expect(result).toEqual([
      { id: 1, name: "Alice", active: true },
      { id: 2, name: "Bob", active: true },
      { id: 3, name: "Charlie", active: true },
    ]);
  });

  it("maintains order of items", async () => {
    // Using different delays to ensure order is maintained even with async operations
    const transformStream = maps(async (x: number) => {
      const delay = x === 2 ? 30 : 10; // Make the middle item take longer
      return new Promise((resolve) => setTimeout(() => resolve(x), delay));
    });

    const writer = transformStream.writable.getWriter();
    const reader = transformStream.readable.getReader();

    writer.write(1);
    writer.write(2);
    writer.write(3);
    writer.close();

    const results = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      results.push(value);
    }

    expect(results).toEqual([1, 2, 3]);
  });
});
