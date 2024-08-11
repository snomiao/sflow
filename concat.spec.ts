import { concatStream } from "./concats";
import { sf } from "./index";

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

    const readable = concatStream([source1, source2, source3])
    const reader = readable.getReader();
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

  it("should concatenate multiple streams in correctly order", async () => {
    const f = jest.fn()
    const source1 = sf([1, 2, 3]).forEach(e => f(e));
    const source2 = sf([4, 5]).forEach(e => f(e));
    const source3 = sf([6, 7, 8, 9]).forEach(e => f(e));

    const readable = concatStream([source1, source2, source3])
    const reader = readable.getReader();
    const result: number[] = [];
    const readOne = async () => {
      const { value, done } = await reader.read();
      if (done) return;
      result.push(value);
      return value
    }

    expect(f).not.toHaveBeenCalled()
    await readOne()
    expect(f).toHaveBeenLastCalledWith(1)
    await readOne()
    expect(f).toHaveBeenLastCalledWith(2)
    await readOne()
    expect(f).toHaveBeenLastCalledWith(3)
    await readOne()
    expect(f).toHaveBeenLastCalledWith(4)
    await readOne()
    await readOne()
    await readOne()
    await readOne()
    await readOne()
    await readOne()
    await readOne()
    await readOne()
    await readOne()
    await readOne()
    await readOne()

    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("should handle no streams", async () => {
    const readable = concatStream()
    const reader = readable.getReader();
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

    const readable = concatStream([source1])
    const reader = readable.getReader();
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

    const readable = concatStream([source1, source2, source3])
    const reader = readable.getReader();
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
