import { concatStream } from "./concats";

describe("concats", () => {
  const createStream = <T>(chunks: T[]): ReadableStream<T> => {
    return new ReadableStream({
      start(controller) {
        chunks.forEach(chunk => controller.enqueue(chunk));
        controller.close();
      }
    });
  };

  it("should concatenate multiple streams correctly", async () => {
    const source1 = createStream([1, 2, 3]);
    const source2 = createStream([4, 5]);
    const source3 = createStream([6, 7, 8, 9]);

    const transform = {readable: concatStream([source1, source2, source3])};
    const reader = transform.readable.getReader();
    const result: number[] = [];

    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (!readerDone && value !== undefined) {
        result.push(value);
      }
      done = readerDone;
    }

    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  
  it("should handle no streams", async () => {
    const transform = {readable: concatStream()};
    const reader = transform.readable.getReader();
    const result: any[] = [];

    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (!readerDone && value !== undefined) {
        result.push(value);
      }
      done = readerDone;
    }

    expect(result).toEqual([]);
  });

  it("should handle a single stream", async () => {
    const source1 = createStream([1, 2, 3]);

    const transform = {readable: concatStream([source1])};
    const reader = transform.readable.getReader();
    const result: number[] = [];

    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (!readerDone && value !== undefined) {
        result.push(value);
      }
      done = readerDone;
    }

    expect(result).toEqual([1, 2, 3]);
  });

  it("should support empty streams within the concatenation", async () => {
    const source1 = createStream([1, 2, 3]);
    const source2 = createStream([]);
    const source3 = createStream([4, 5]);

    const transform = {readable: concatStream([source1, source2, source3])};
    const reader = transform.readable.getReader();
    const result: number[] = [];

    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (!readerDone && value !== undefined) {
        result.push(value);
      }
      done = readerDone;
    }

    expect(result).toEqual([1, 2, 3, 4, 5]);
  });
});
