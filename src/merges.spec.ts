import sflow from "./index";
import { mergeStream } from "./mergeStream";
import { sleep } from "./utils";

it("propagates error from one source to consumer", async () => {
  const boom = new ReadableStream({
    start: (ctrl) => ctrl.error(new Error("stream exploded")),
  });
  await expect(sflow(mergeStream(boom, [1, 2, 3])).toArray()).rejects.toThrow(
    "stream exploded",
  );
});

it("merge different type", async () => {
  expect(
    await sflow(mergeStream(["1", "2", "3", "4"], [5, 6, 7, 8])).toArray(),
  ).toEqual(["1", 5, "2", 6, "3", 7, "4", 8]);
});

it("zips when same speed", async () => {
  expect(
    await sflow(mergeStream([1, 2, 3, 4], [5, 6, 7, 8])).toArray(),
  ).toEqual([1, 5, 2, 6, 3, 7, 4, 8]);
});

it("works when a stream slower", async () => {
  expect(
    await sflow(
      mergeStream(
        sflow([1, 2, 3, 4]).forEach(async () => {
          await sleep(30);
        }),
        [5, 6, 7, 8],
      ),
    ).toArray(),
  ).toEqual([5, 6, 7, 8, 1, 2, 3, 4]);
});

it("zips in timing order", async () => {
  expect(
    await sflow(
      mergeStream(
        sflow([30, 20, 40, 80]).asyncMap(async (ms) => (await sleep(ms), ms)),
        sflow([70, 60, 50, 10]).asyncMap(async (ms) => (await sleep(ms), ms)),
      ),
    ).toArray(),
  ).toEqual([10, 20, 30, 40, 50, 60, 70, 80]);
});
