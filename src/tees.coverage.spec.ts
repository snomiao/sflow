import { it, expect } from "bun:test";
import { tees } from "./tees";
import { sflow } from "./sflow";

it("tees with no arg returns passthrough", async () => {
  const ts = tees<number>();
  const writer = ts.writable.getWriter();
  writer.write(1);
  writer.write(2);
  writer.close();
  const result = await sflow(ts.readable).toArray();
  expect(result).toEqual([1, 2]);
});

it("tees with function forks stream to side effect", async () => {
  const sideItems: number[] = [];
  const ts = tees<number>((s: ReadableStream<number>) => {
    s.pipeTo(
      new WritableStream({
        write(chunk) {
          sideItems.push(chunk);
        },
      }),
    );
  });

  const writer = ts.writable.getWriter();
  writer.write(1);
  writer.write(2);
  writer.write(3);
  writer.close();

  const mainResult = await sflow(ts.readable).toArray();
  expect(mainResult).toEqual([1, 2, 3]);
  // side effect consumed asynchronously, just ensure it ran eventually
  await new Promise((r) => setTimeout(r, 10));
  expect(sideItems).toEqual([1, 2, 3]);
});

it("tees with WritableStream pipes to it", async () => {
  const received: number[] = [];
  const writable = new WritableStream<number>({
    write(chunk) {
      received.push(chunk);
    },
  });

  const ts = tees<number>(writable);
  const writer = ts.writable.getWriter();
  writer.write(10);
  writer.write(20);
  writer.close();

  const mainResult = await sflow(ts.readable).toArray();
  expect(mainResult).toEqual([10, 20]);
  await new Promise((r) => setTimeout(r, 10));
  expect(received).toEqual([10, 20]);
});

it("works via sflow tees/forkTo method", async () => {
  const sideItems: number[] = [];
  const result = await sflow([1, 2, 3])
    .tees((s) => s.pipeTo(new WritableStream({ write: (c) => { sideItems.push(c); } })))
    .toArray();
  expect(result).toEqual([1, 2, 3]);
  await new Promise((r) => setTimeout(r, 10));
  expect(sideItems).toEqual([1, 2, 3]);
});
