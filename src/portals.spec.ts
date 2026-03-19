import { it, expect } from "bun:test";
import { portals } from "./portals";
import { sflow } from "./sflow";

it("portals with no arg returns passthrough", async () => {
  const ts = portals<number>();
  const writer = ts.writable.getWriter();
  writer.write(1);
  writer.write(2);
  writer.close();
  const result = await sflow(ts.readable).toArray();
  expect(result).toEqual([1, 2]);
});

it("portals with TransformStream pipes through it", async () => {
  const doubler = new TransformStream<number, number>({
    transform(chunk, ctrl) {
      ctrl.enqueue(chunk * 2);
    },
  });
  const ts = portals(doubler);
  const writer = ts.writable.getWriter();
  writer.write(3);
  writer.write(4);
  writer.close();
  const result = await sflow(ts.readable).toArray();
  expect(result).toEqual([6, 8]);
});

it("portals with function applies it to the readable", async () => {
  const ts = portals<number>((s) => {
    const t = new TransformStream<number, number>({
      transform(chunk, ctrl) {
        ctrl.enqueue(chunk + 10);
      },
    });
    return s.pipeThrough(t);
  });
  const writer = ts.writable.getWriter();
  writer.write(1);
  writer.write(2);
  writer.close();
  const result = await sflow(ts.readable).toArray();
  expect(result).toEqual([11, 12]);
});

it("works via sflow portal method", async () => {
  const doubler = new TransformStream<number, number>({
    transform(chunk, ctrl) {
      ctrl.enqueue(chunk * 3);
    },
  });
  const result = await sflow([1, 2, 3]).portal(doubler).toArray();
  expect(result).toEqual([3, 6, 9]);
});
