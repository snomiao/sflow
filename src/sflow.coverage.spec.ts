import { it, expect, describe } from "bun:test";
import { sflow } from "./sflow";

describe("sflow methods coverage", () => {
  it("cacheSkip method works with map store", async () => {
    const store = new Map<string, number[]>();
    const mapStore = {
      has: (key: string) => store.has(key),
      get: (key: string) => store.get(key),
      set: (key: string, v: number[]) => { store.set(key, v); },
    };
    const result = await sflow([1, 2, 3]).cacheSkip(mapStore, "test-key").toArray();
    expect(result.length).toBeGreaterThan(0);
  });

  it("cacheList method works with map store", async () => {
    const store = new Map<string, number[]>();
    const mapStore = {
      has: (key: string) => store.has(key),
      get: (key: string) => store.get(key),
      set: (key: string, v: number[]) => { store.set(key, v); },
    };
    const result = await sflow([1, 2, 3]).cacheList(mapStore, "test-key").toArray();
    expect(result).toEqual([1, 2, 3]);
  });

  it("chunkIf method works", async () => {
    const result = await sflow([1, 2, 3, 4, 5])
      .chunkIf((a, b) => b - a > 1)
      .toArray();
    expect(result.flat()).toEqual([1, 2, 3, 4, 5]);
  });

  it("head method passes first n items", async () => {
    const ts = sflow([1, 2, 3]).head(2);
    const reader = ts.getReader();
    const r1 = await reader.read();
    expect(r1.value).toBe(1);
    const r2 = await reader.read();
    expect(r2.value).toBe(2);
    reader.releaseLock();
  });

  it("onTransform method applies transform callback", async () => {
    const result = await sflow([1, 2, 3])
      .onTransform((chunk: number, ctrl) => { ctrl.enqueue(chunk * 10); })
      .toArray();
    expect(result).toEqual([10, 20, 30]);
  });

  it("portal method pipes through a TransformStream", async () => {
    const doubler = new TransformStream<number, number>({
      transform(chunk, ctrl) { ctrl.enqueue(chunk * 2); },
    });
    const result = await sflow([1, 2, 3]).portal(doubler).toArray();
    expect(result).toEqual([2, 4, 6]);
  });

  it("join/riffle method", async () => {
    const result = await sflow([1, 2, 3]).join(0).toArray();
    expect(result).toEqual([1, 0, 2, 0, 3]);
  });

  it("match method on string stream", async () => {
    const result = await sflow(["hello world", "foo bar"])
      // @ts-ignore
      .match(/\w+/g)
      .toArray();
    expect(result.length).toBeGreaterThan(0);
  });

  it("matchAll method on string stream", async () => {
    const result = await sflow(["hello world"])
      // @ts-ignore
      .matchAll(/(\w+)/g)
      .toArray();
    expect(result.length).toBeGreaterThan(0);
  });

  it("replace method on string stream", async () => {
    const result = await sflow(["hello world"])
      // @ts-ignore
      .replace("world", "there")
      .toArray();
    expect(result).toEqual(["hello there"]);
  });

  it("replaceAll method on string stream", async () => {
    const result = await sflow(["aabbaa"])
      // @ts-ignore
      .replaceAll("a", "x")
      .toArray();
    expect(result).toEqual(["xxbbxx"]);
  });

  it("unique method deduplicate items", async () => {
    const result = await sflow([1, 2, 2, 3, 1]).unique().toArray();
    expect(result).toEqual([1, 2, 3]);
  });

  it("uniq method deduplicate items", async () => {
    const result = await sflow([1, 2, 2, 3]).uniq().toArray();
    expect(result).toEqual([1, 2, 3]);
  });

  it("forkTo method forks stream", async () => {
    const collected: number[] = [];
    const writable = new WritableStream<number>({
      write(chunk) { collected.push(chunk); },
    });
    const result = await sflow([1, 2, 3]).forkTo(writable).toArray();
    expect(result).toEqual([1, 2, 3]);
    await new Promise((r) => setTimeout(r, 10));
    expect(collected).toEqual([1, 2, 3]);
  });

  it("reduceEmit emits intermediate accumulator values", async () => {
    const result = await sflow([1, 2, 3, 4])
      .reduceEmit((acc: number, x: number) => ({ next: acc + x, emit: acc + x }), 0)
      .toArray();
    expect(result).toEqual([1, 3, 6, 10]);
  });

  it("toCount returns the number of items", async () => {
    const count = await sflow([1, 2, 3, 4, 5]).toCount();
    expect(count).toBe(5);
  });

  it("toFirst returns first item", async () => {
    const first = await sflow([10, 20, 30]).toFirst();
    expect(first).toBe(10);
  });

  it("toFirstMatch returns first matching item", async () => {
    const first = await sflow([1, 2, 3, 4]).toFirstMatch((x) => x > 2);
    expect(first).toBe(3);
  });

  it("toLast returns last item", async () => {
    const last = await sflow([1, 2, 3]).toLast();
    expect(last).toBe(3);
  });

  it("toExactlyOne returns the single item", async () => {
    const val = await sflow([42]).toExactlyOne();
    expect(val).toBe(42);
  });

  it("toExactlyOne throws when more than one item", async () => {
    await expect(sflow([1, 2]).toExactlyOne()).rejects.toThrow();
  });

  it("toOne returns item when only one", async () => {
    const val = await sflow([7]).toOne();
    expect(val).toBe(7);
  });

  it("toOne returns undefined when empty", async () => {
    const val = await sflow([] as number[]).toOne();
    expect(val).toBeUndefined();
  });

  it("toOne throws when more than one item", async () => {
    await expect(sflow([1, 2]).toOne()).rejects.toThrow();
  });

  it("toAtLeastOne returns item when exactly one", async () => {
    const val = await sflow([99]).toAtLeastOne();
    expect(val).toBe(99);
  });

  it("toAtLeastOne throws when empty", async () => {
    await expect(sflow([] as number[]).toAtLeastOne()).rejects.toThrow();
  });

  it("json method returns parsed JSON", async () => {
    const result = await sflow(['{"a":1}']).json();
    expect(result).toEqual({ a: 1 });
  });

  it("text method returns text", async () => {
    const result = await sflow(["hello"]).text();
    expect(result).toBe("hello");
  });

  it("blob method returns Blob", async () => {
    const result = await sflow(["hello"]).blob();
    expect(result).toBeInstanceOf(Blob);
  });

  it("arrayBuffer method returns ArrayBuffer-like", async () => {
    const result = await sflow(["hello"]).arrayBuffer();
    // In Bun, arrayBuffer may return a SharedArrayBuffer or ArrayBuffer
    expect(result.byteLength).toBeGreaterThan(0);
  });

  it("end method pipes to writable", async () => {
    const received: number[] = [];
    const writable = new WritableStream<number>({
      write(chunk) { received.push(chunk); },
    });
    await sflow([1, 2, 3]).end(writable);
    expect(received).toEqual([1, 2, 3]);
  });

  it("to method pipes to writable", async () => {
    const received: number[] = [];
    const writable = new WritableStream<number>({
      write(chunk) { received.push(chunk); },
    });
    await sflow([1, 2, 3]).to(writable);
    expect(received).toEqual([1, 2, 3]);
  });

  it("run method drains stream", async () => {
    let count = 0;
    await sflow([1, 2, 3]).forEach(() => { count++; }).run();
    expect(count).toBe(3);
  });

  it("toEnd method drains stream", async () => {
    let count = 0;
    await sflow([1, 2, 3]).forEach(() => { count++; }).toEnd();
    expect(count).toBe(3);
  });

  it("toNil method drains stream", async () => {
    let count = 0;
    await sflow([1, 2, 3]).forEach(() => { count++; }).toNil();
    expect(count).toBe(3);
  });

  it("toResponse returns a Response", () => {
    const resp = sflow(["hello"]).toResponse();
    expect(resp).toBeInstanceOf(Response);
  });

  it("async iterator works", async () => {
    const items: number[] = [];
    for await (const x of sflow([1, 2, 3])) {
      items.push(x);
    }
    expect(items).toEqual([1, 2, 3]);
  });

  it("confluenceByConcat flattens stream of streams in order", async () => {
    const result = await sflow([
      new ReadableStream({ start: (c) => { c.enqueue(1); c.enqueue(2); c.close(); } }),
      new ReadableStream({ start: (c) => { c.enqueue(3); c.close(); } }),
    ]).confluenceByConcat().toArray();
    expect(result).toEqual([1, 2, 3]);
  });

  it("confluenceByParallel merges streams in parallel", async () => {
    const result = await sflow([
      new ReadableStream({ start: (c) => { c.enqueue(1); c.enqueue(2); c.close(); } }),
      new ReadableStream({ start: (c) => { c.enqueue(3); c.close(); } }),
    ]).confluenceByParallel().toArray();
    expect(result.sort()).toEqual([1, 2, 3]);
  });

  it("confluenceByAscend merges sorted streams in ascending order", async () => {
    const result = await sflow([
      new ReadableStream({ start: (c) => { c.enqueue(1); c.enqueue(3); c.close(); } }),
      new ReadableStream({ start: (c) => { c.enqueue(2); c.enqueue(4); c.close(); } }),
    ]).confluenceByAscend((x: number) => x).toArray();
    expect(result).toEqual([1, 2, 3, 4]);
  });

  it("confluenceByDescend merges sorted streams in descending order", async () => {
    const result = await sflow([
      new ReadableStream({ start: (c) => { c.enqueue(4); c.enqueue(2); c.close(); } }),
      new ReadableStream({ start: (c) => { c.enqueue(3); c.enqueue(1); c.close(); } }),
    ]).confluenceByDescend((x: number) => x).toArray();
    expect(result).toEqual([4, 3, 2, 1]);
  });

  it("preventAbort allows stream to continue after upstream error (passthrough)", async () => {
    // preventAbort just creates a pipeThrough with the option
    const result = await sflow([1, 2, 3]).preventAbort().toArray();
    expect(result).toEqual([1, 2, 3]);
  });

  it("preventClose method returns a sflow (verify method exists)", () => {
    // preventClose with preventClose:true means the downstream writable won't auto-close
    // We just verify the method exists and creates a sflow object
    const s = sflow([1, 2, 3]);
    const pc = s.preventClose();
    expect(typeof pc.toArray).toBe("function");
  });

  it("preventCancel passes items through", async () => {
    const result = await sflow([1, 2, 3]).preventCancel().toArray();
    expect(result).toEqual([1, 2, 3]);
  });
});
