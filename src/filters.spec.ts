import { describe, it, expect } from "vitest";
import { filters } from "./filters";

describe("filters", () => {
  describe("without predicate function", () => {
    it("should filter out null values", async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(1);
          controller.enqueue(null);
          controller.enqueue(2);
          controller.enqueue(3);
          controller.close();
        },
      });

      const filtered = stream.pipeThrough(filters());
      const reader = filtered.getReader();
      const results = [];

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (!done) {
          results.push(value);
        }
      }

      expect(results).toEqual([1, 2, 3]);
    });

    it("should filter out undefined values", async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue("a");
          controller.enqueue(undefined);
          controller.enqueue("b");
          controller.enqueue("c");
          controller.close();
        },
      });

      const filtered = stream.pipeThrough(filters());
      const reader = filtered.getReader();
      const results = [];

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (!done) {
          results.push(value);
        }
      }

      expect(results).toEqual(["a", "b", "c"]);
    });

    it("should keep falsy values that are not null or undefined", async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(0);
          controller.enqueue(false);
          controller.enqueue("");
          controller.enqueue(null);
          controller.enqueue(undefined);
          controller.enqueue("valid");
          controller.close();
        },
      });

      const filtered = stream.pipeThrough(filters());
      const reader = filtered.getReader();
      const results = [];

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (!done) {
          results.push(value);
        }
      }

      expect(results).toEqual([0, false, "", "valid"]);
    });
  });

  describe("with predicate function", () => {
    it("should filter based on predicate function", async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(1);
          controller.enqueue(2);
          controller.enqueue(3);
          controller.enqueue(4);
          controller.enqueue(5);
          controller.close();
        },
      });

      const filtered = stream.pipeThrough(filters((x: number) => x % 2 === 0));
      const reader = filtered.getReader();
      const results = [];

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (!done) {
          results.push(value);
        }
      }

      expect(results).toEqual([2, 4]);
    });

    it("should pass index to predicate function", async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue("a");
          controller.enqueue("b");
          controller.enqueue("c");
          controller.enqueue("d");
          controller.close();
        },
      });

      const indices: number[] = [];
      const filtered = stream.pipeThrough(
        filters((x: string, i: number) => {
          indices.push(i);
          return i % 2 === 0; // Keep items at even indices
        })
      );
      const reader = filtered.getReader();
      const results = [];

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (!done) {
          results.push(value);
        }
      }

      expect(results).toEqual(["a", "c"]);
      expect(indices).toEqual([0, 1, 2, 3]);
    });

    it("should handle async predicate functions", async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(1);
          controller.enqueue(2);
          controller.enqueue(3);
          controller.enqueue(4);
          controller.close();
        },
      });

      const filtered = stream.pipeThrough(
        filters(async (x: number) => {
          await new Promise(resolve => setTimeout(resolve, 1));
          return x > 2;
        })
      );
      const reader = filtered.getReader();
      const results = [];

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (!done) {
          results.push(value);
        }
      }

      expect(results).toEqual([3, 4]);
    });

    it("should filter based on truthy/falsy return values", async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue("keep");
          controller.enqueue("skip");
          controller.enqueue("keep2");
          controller.enqueue("skip2");
          controller.close();
        },
      });

      const filtered = stream.pipeThrough(
        filters((x: string) => x.includes("keep"))
      );
      const reader = filtered.getReader();
      const results = [];

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (!done) {
          results.push(value);
        }
      }

      expect(results).toEqual(["keep", "keep2"]);
    });

    it("should handle empty stream", async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.close();
        },
      });

      const filtered = stream.pipeThrough(filters((x: any) => true));
      const reader = filtered.getReader();
      const results = [];

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (!done) {
          results.push(value);
        }
      }

      expect(results).toEqual([]);
    });

    it("should handle predicate that always returns false", async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(1);
          controller.enqueue(2);
          controller.enqueue(3);
          controller.close();
        },
      });

      const filtered = stream.pipeThrough(filters(() => false));
      const reader = filtered.getReader();
      const results = [];

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (!done) {
          results.push(value);
        }
      }

      expect(results).toEqual([]);
    });

    it("should handle predicate that always returns true", async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(1);
          controller.enqueue(2);
          controller.enqueue(3);
          controller.close();
        },
      });

      const filtered = stream.pipeThrough(filters(() => true));
      const reader = filtered.getReader();
      const results = [];

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (!done) {
          results.push(value);
        }
      }

      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe("edge cases", () => {
    it("should handle complex objects", async () => {
      const obj1 = { id: 1, name: "Alice" };
      const obj2 = { id: 2, name: "Bob" };
      const obj3 = { id: 3, name: "Charlie" };

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(obj1);
          controller.enqueue(obj2);
          controller.enqueue(obj3);
          controller.close();
        },
      });

      const filtered = stream.pipeThrough(
        filters((obj: any) => obj.id % 2 === 1)
      );
      const reader = filtered.getReader();
      const results = [];

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (!done) {
          results.push(value);
        }
      }

      expect(results).toEqual([obj1, obj3]);
    });

    it("should handle arrays", async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue([1, 2]);
          controller.enqueue([]);
          controller.enqueue([3, 4, 5]);
          controller.enqueue(null);
          controller.close();
        },
      });

      const filtered = stream.pipeThrough(
        filters((arr: any) => Array.isArray(arr) && arr.length > 0)
      );
      const reader = filtered.getReader();
      const results = [];

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (!done) {
          results.push(value);
        }
      }

      expect(results).toEqual([[1, 2], [3, 4, 5]]);
    });
  });
});
