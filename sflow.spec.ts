import sflow, { rangeStream, uniqs } from "./index";
import { svector } from "./svector";

it("merge different type", async () => {
  const out = ["1", 5, "2", 6, "3", 7, "4", 8];
  expect(await sflow(["1", "2", "3", "4"], [5, 6, 7, 8]).toArray()).toEqual(
    out
  );
});

it("tees", async () => {
  let flow1 = sflow([1, 2, 3]);
  const flow2 = flow1.tees((x) => (flow1 = x));
  expect(flow1.locked).toEqual(false);
  const flow3 = flow1.tees((b) => (flow1 = b));
  expect(flow1.locked).toEqual(false);
  const flow4 = flow1.tees();
  expect(flow1.locked).toEqual(true);
  expect(await flow2.toArray()).toEqual([1, 2, 3]);
  expect(await flow3.toArray()).toEqual([1, 2, 3]);
  expect(await flow4.toArray()).toEqual([1, 2, 3]);
});

it("counts", async () => {
  expect(await sflow([] as string[]).toCount()).toBe(0);
  expect(await sflow([1, 2, 3]).toCount()).toBe(3);
  expect(await sflow(rangeStream(0, 1000000)).toCount()).toBe(1000000);
});

it("uniqs", async () => {
  let flow0 = sflow([1, 4, 2, 2, 3, 3, {}, {}]);
  expect(await flow0.through(uniqs()).toArray()).toEqual([1, 4, 2, 3, {}, {}]);
});

it("stream vector", async () => {
  let flow0 = svector(1, 4, 2, 2, 3, 3);
  expect(await flow0.through(uniqs()).toArray()).toEqual([1, 4, 2, 3]);
});

function lasts<T>(): TransformStream<T, T> {
  let last: T;
  const ready = Promise.withResolvers();
  const writable = new WritableStream<T>({
    write: (chunk) => {
      last = chunk;
      ready.resolve();
    },
  });
  const readable = new ReadableStream<T>({
    pull: async (ctrl) => {
      await ready.promise;
      ctrl.enqueue(last);
    },
  });
  return { writable, readable };
}
// it("using", async () => {
//   let p: snoflow<number>;
//   await (async function () {
//     await using f = snoflow([1, 2, 3]);
//     p = f;
//     expect(f.locked).toBe(false);
//   })();
//   expect(await p!.toArray()).toEqual([1, 2, 3]);
//   expect(p!.locked).toBe(true);
//   // expect(f.locked).toBe(true);
// });
