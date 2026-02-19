import { sflow } from "./sflow";
import { unpromises, unpromisesFn } from "./unpromises";
import { sleep } from "./utils";

it("propagates rejection of the promise to consumer", async () => {
  const rejected = Promise.reject(new Error("bad promise"));
  await expect(sflow(unpromises(rejected)).toArray()).rejects.toThrow(
    "bad promise",
  );
});

it("propagates error from the resolved stream to consumer", async () => {
  const erroring = Promise.resolve(
    new ReadableStream({ start: (ctrl) => ctrl.error(new Error("bad stream")) }),
  );
  await expect(sflow(unpromises(erroring)).toArray()).rejects.toThrow(
    "bad stream",
  );
});

it("works", async () => {
  const p = getStream();
  expect(p).toBeInstanceOf(Promise);
  expect(await sflow(unpromises(p)).toArray()).toEqual([1, 2, 3]);
});

async function getStream() {
  return sflow([1, 2, 3]);
}

it("by async fn", async () => {
  expect(
    await sflow([1, 2, 3])
      .by(
        unpromisesFn(async (src: sflow<number>) => {
          await sleep(100);
          return src.map((x) => x * 2);
        }),
      )
      .toArray(),
  ).toEqual([2, 4, 6]);
});
