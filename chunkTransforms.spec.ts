import { chunkTransforms } from "./chunkTransforms";
import { nils } from "./nils";

type MockController<T> = {
  enqueued: T[];
  enqueue: (chunk: T) => void;
};

const createMockController = <T>(): MockController<T> => {
  const enqueued: T[] = [];
  return {
    enqueued,
    enqueue: (chunk: T) => enqueued.push(chunk),
  };
};

describe("chunkTransforms", () => {
  it("should call start transformer", async () => {
    const startMock = jest.fn().mockResolvedValue([]);
    const transformStream = chunkTransforms({
      start: startMock,
    });
    const writer = transformStream.writable.getWriter();
    await writer.ready;
    expect(startMock).toHaveBeenCalled();
    await writer.close();
  });

  it("should call transform transformer", async () => {
    const transformMock = jest.fn().mockResolvedValue([]);
    const transformStream = chunkTransforms({
      transform: transformMock,
    });
    transformStream.readable.pipeTo(nils()); // kick stream
    const writer = transformStream.writable.getWriter();
    await writer.write("test");
    expect(transformMock).toHaveBeenCalledWith(["test"], expect.anything());
    await writer.close();
  });

  it("should call flush transformer", async () => {
    const flushMock = jest.fn().mockResolvedValue([]);
    const transformStream = chunkTransforms({
      flush: flushMock,
    });
    transformStream.readable.pipeTo(nils()); // kick stream
    const writer = transformStream.writable.getWriter();
    await writer.write("test");
    await writer.ready;
    await writer.close();
    expect(flushMock).toHaveBeenCalledWith(["test"], expect.anything());
  });

  it("should accumulate chunks with the transform function", async () => {
    const mockController = createMockController<string>();
    const transformMock = jest.fn((chunks: string[]) => {
      mockController.enqueue(chunks.join(""));
      return Promise.resolve(chunks);
    });
    const transformStream = chunkTransforms({
      transform: transformMock,
    });
    transformStream.readable.pipeTo(nils()); // kick stream
    const writer = transformStream.writable.getWriter();
    await writer.write("chunk1");
    await writer.write("chunk2");
    await writer.close();
    expect(mockController.enqueued).toEqual(["chunk1", "chunk1chunk2"]);
  });

  it("should can modify chunks with the transform function", async () => {
    const mockController = createMockController<string>();
    const transformMock = jest.fn(async (chunks: string[]) => {
      mockController.enqueue(chunks.join(""));
      return chunks.toSpliced(0,1)
    });
    const transformStream = chunkTransforms({
      transform: transformMock,
    });
    transformStream.readable.pipeTo(nils()); // kick stream
    const writer = transformStream.writable.getWriter();
    await writer.write("chunk1");
    await writer.write("chunk2");
    await writer.close();
    expect(mockController.enqueued).toEqual(["chunk1", "chunk2"]);
  });
});
