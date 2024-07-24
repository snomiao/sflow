import { reduces } from "./reduces";
import { sflow } from "./sflow";

describe("reduces function", () => {
  it("accumulates state based on initial state", async () => {
    const initialState = 0;
    const transformStream = reduces(
      (state, x: number) => state + x,
      initialState
    );
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

    expect(results).toEqual([1, 3, 6]);
  });

  it("accumulates state without initial state", async () => {
    const transformStream = reduces(
      (state: number = 0, x: number) => state + x
    );
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

    expect(results).toEqual([1, 3, 6]);
  });

  it("supports different types for state and chunks", async () => {
    const initialState = "";
    const transformStream = reduces((state, x) => state + x, initialState);
    const writer = transformStream.writable.getWriter();
    const reader = transformStream.readable.getReader();

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

    expect(results).toEqual(["a", "ab", "abc"]);
  });

  it("accumulates state asynchronously", async () => {
    const initialState = 1;
    const transformStream = reduces(async (state, x) => {
      return new Promise((resolve) => setTimeout(() => resolve(state * x), 50));
    }, initialState);
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

    expect(results).toEqual([1, 2, 6]);
  });

  it("works with pipeline with initialState", async () => {
    expect(
      await sflow([1, 2, 3, 4])
        .reduce((a, b) => a + b, 0)
        .toLast()
    ).toBe(1 + 2 + 3 + 4);
  });
  it("works with pipeline without initialState", async () => {
    expect(
      await sflow([1, 2, 3, 4])
        .reduce((a = 0, b) => a + b)
        .toLast()
    ).toBe(1 + 2 + 3 + 4);
  });
});
