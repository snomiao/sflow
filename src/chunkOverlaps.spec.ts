import { chunkOverlaps } from "./chunkOverlaps";
import { sflow } from "./index";

it("chunkOverlaps 1", async () => {
  const stream = new ReadableStream<number>({
    start(ctrl) {
      for (let i = 0; i < 10; i++) ctrl.enqueue(i);
      ctrl.close();
    },
  });
  const result = await sflow(stream)
    .by(chunkOverlaps({ step: 3, overlap: 1 }))
    .toArray();
  expect(result).toEqual([[0, 1, 2, 3], [3, 4, 5, 6], [6, 7, 8, 9], [9]]);
});

it("chunkOverlaps with overlap=0", async () => {
  const stream = new ReadableStream<number>({
    start(ctrl) {
      for (let i = 0; i < 10; i++) ctrl.enqueue(i);
      ctrl.close();
    },
  });
  const result = await sflow(stream)
    .by(chunkOverlaps({ step: 5, overlap: 0 }))
    .toArray();
  expect(result).toEqual([
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
  ]);
});

it("chunkOverlaps with step=1", async () => {
  const stream = new ReadableStream<number>({
    start(ctrl) {
      for (let i = 0; i < 10; i++) ctrl.enqueue(i);
      ctrl.close();
    },
  });
  const result = await sflow(stream)
    .by(chunkOverlaps({ step: 1, overlap: 0 }))
    .toArray();
  expect(result).toEqual([[0], [1], [2], [3], [4], [5], [6], [7], [8], [9]]);
});
it("chunkOverlaps with step=1 and overlap=1", async () => {
  const stream = new ReadableStream<number>({
    start(ctrl) {
      for (let i = 0; i < 10; i++) ctrl.enqueue(i);
      ctrl.close();
    },
  });
  const result = await sflow(stream)
    .by(chunkOverlaps({ step: 1, overlap: 1 }))
    .toArray();
  expect(result).toEqual([
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [9],
  ]);
});
