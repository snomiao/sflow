import { sleep } from "bun";
import { reduceEmits } from "./reduceEmits";

describe("reduceEmits", () => {
  test("should reduce and emit correctly for a simple case", async () => {
    const state = 0;
    const reducer = (state = 0, x = 0) => ({
      next: state + x,
      emit: state + x,
    });

    const transform = reduceEmits(reducer, state);
    const writer = transform.writable.getWriter();
    const reader = transform.readable.getReader();

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

    expect(results).toEqual([1, 3, 6]);
  });

  test("should handle async functions correctly", async () => {
    const state = 0;
    const reducer = async (state = 0, x = 0) => {
      await sleep(10); // Adding a small sleep for testing async
      return { next: state + x, emit: state + x };
    };

    const transform = reduceEmits(reducer, state);
    const writer = transform.writable.getWriter();
    const reader = transform.readable.getReader();

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

    expect(results).toEqual([1, 3, 6]);
  });

  test("should transform state and emit different types", async () => {
    const init = { count: 0, items: [] as string[] };

    const transform = reduceEmits((state = init, x: string) => {
      const newState = {
        count: state.count + 1,
        items: [...state.items, x],
      };
      const emit = { currentCount: newState.count, item: x };
      return { state: newState, emit: emit };
    }, init);
    const writer = transform.writable.getWriter();
    const reader = transform.readable.getReader();

    writer.write("a");
    writer.write("b");
    writer.write("c");
    writer.close();

    const results = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      results.push(value);
    }

    expect(results).toEqual([
      { currentCount: 1, item: "a" },
      { currentCount: 2, item: "b" },
      { currentCount: 3, item: "c" },
    ]);
  });
});
