import { it, expect } from "bun:test";
import { throughs } from "./throughs";
import { sflow } from "./sflow";

it("throughs with no arg returns passthrough TransformStream", async () => {
  const ts = throughs<number>();
  const writer = ts.writable.getWriter();
  writer.write(1);
  writer.write(2);
  writer.close();
  const result = await sflow(ts.readable).toArray();
  expect(result).toEqual([1, 2]);
});

it("throughs with TransformStream wraps it", async () => {
  const doubler = new TransformStream<number, number>({
    transform(chunk, ctrl) { ctrl.enqueue(chunk * 2); },
  });
  const ts = throughs(doubler);
  const writer = ts.writable.getWriter();
  writer.write(5);
  writer.write(10);
  writer.close();
  const result = await sflow(ts.readable).toArray();
  expect(result).toEqual([10, 20]);
});

it("throughs with function applies function to readable", async () => {
  const ts = throughs<number, number>((s: ReadableStream<number>) =>
    s.pipeThrough(
      new TransformStream<number, number>({
        transform(chunk, ctrl) { ctrl.enqueue(chunk + 100); },
      }),
    ),
  );
  const writer = ts.writable.getWriter();
  writer.write(1);
  writer.write(2);
  writer.close();
  const result = await sflow(ts.readable).toArray();
  expect(result).toEqual([101, 102]);
});
