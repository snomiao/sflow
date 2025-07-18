import { sflow } from "./sf";

it("Works merge parallel", async () => {
  const { readable, writable } = new TransformStream<number, number>();
  (async function () {
    const w = writable.getWriter();
    console.log("writing");
    await Promise.all([
      sflow([1, 2, 3])
        .map((e) => w.write(e))
        .done(),
      sflow([4, 5, 6])
        .map((e) => w.write(e))
        .done(),
    ]);
    console.log("written");
    await w.close();
  })();
  expect(await sflow(readable).toArray()).toEqual([1, 4, 2, 5, 3, 6]);
});

it("Works merge parallel 2", async () => {
  const srcs = [sflow([1, 2, 3]), sflow([4, 5, 6])];

  const { readable, writable } = new TransformStream<number, number>();
  (async function () {
    const w = writable.getWriter();
    console.log("writing");
    await sflow(srcs)
      .pMap((s) => s.map((e) => w.write(e)).done())
      .done();
    console.log("written");
    await w.close();
  })();

  expect(await sflow(readable).toArray()).toEqual([1, 4, 2, 5, 3, 6]);
});
