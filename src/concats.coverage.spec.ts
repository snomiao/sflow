import { it, expect } from "bun:test";
import { concats } from "./concats";
import { sflow } from "./sf";

it("concats with no source returns passthrough", async () => {
  const ts = concats();
  const writer = ts.writable.getWriter();
  writer.write(1);
  writer.write(2);
  writer.close();
  const result = await sflow(ts.readable).toArray();
  expect(result).toEqual([1, 2]);
});

it("concats upstream with additional sources", async () => {
  const ts = concats<number>([
    new ReadableStream({
      start(ctrl) {
        ctrl.enqueue(10);
        ctrl.enqueue(20);
        ctrl.close();
      },
    }),
  ]);

  const writer = ts.writable.getWriter();
  writer.write(1);
  writer.write(2);
  writer.close();

  const result = await sflow(ts.readable).toArray();
  expect(result).toEqual([1, 2, 10, 20]);
});

it("works via sflow concat method", async () => {
  const result = await sflow([1, 2, 3])
    .concat([
      new ReadableStream({ start: (c) => { c.enqueue(4); c.close(); } }),
      new ReadableStream({ start: (c) => { c.enqueue(5); c.close(); } }),
    ])
    .toArray();
  expect(result).toEqual([1, 2, 3, 4, 5]);
});
