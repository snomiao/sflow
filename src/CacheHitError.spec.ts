import { CacheHitError } from "./CacheHitError";
import { sflow } from "./sflow";
import { sleep } from "./utils";

it("handles cache hit error", async () => {
  const ws = new WritableStream(
    {
      write: (chunk, ctrl) => {
        console.log("write chunk: ", chunk);
        ctrl.error(
          new CacheHitError("Cache hit when stream write", {
            cause: { chunk },
          }),
        );
      },
    },
    { highWaterMark: 1 },
  );
  const w = ws.getWriter();
  expect(await w.write("asdf")).toBe(undefined);
  expect(await w.write("zxcv").catch(CacheHitError.nil)).toBe(null);
  expect(await w.write("qwer").catch(CacheHitError.nil)).toBe(null);
  expect(await w.write("qwop").catch(CacheHitError.nil)).toBe(null);

  console.log("done");
});

it("handles cache hit error when stream start", async () => {
  const ws = new WritableStream(
    {
      start: (ctrl) => {
        ctrl.error(new CacheHitError("Cache hit when stream start"));
      },
      write: (chunk, _ctrl) => {
        console.log("write chunk: ", chunk);
      },
    },
    { highWaterMark: 1 },
  );
  const w = ws.getWriter();
  expect(await w.write("zxcv").catch(CacheHitError.nil)).toBe(null);
  expect(await w.write("qwer").catch(CacheHitError.nil)).toBe(null);
  expect(await w.write("qwop").catch(CacheHitError.nil)).toBe(null);

  console.log("done");
});

it("handles cache hit error with start pipeTo", async () => {
  let i = 0;
  const rs = new ReadableStream(
    {
      pull: (ctrl) => {
        console.log(`pull st ${i}`);
        ctrl.enqueue(i);
        ++i < 10 || ctrl.close();
      },
    },
    { highWaterMark: 0 },
  );
  const ws = new WritableStream(
    {
      start: async (ctrl) => {
        await sleep(100);
        ctrl.error(new CacheHitError("Cache hit when stream start"));
      },
    },
    { highWaterMark: 0 }, // WARN: not writable...
  );
  await rs.pipeTo(ws).catch(CacheHitError.nil);
  console.log("done");
});
it("handles cache hit error with write pipeTo", async () => {
  const ws = new WritableStream({
    write: (_, ctrl) =>
      ctrl.error(new CacheHitError("Cache hit when stream write")),
  });
  await sflow([1, 2, 3, 4]).pipeTo(ws).catch(CacheHitError.nil);
  console.log("done");
});

it("handles cache hit error with pipeTo", async () => {
  let i = 0;
  const rs = new ReadableStream({
    pull: (ctrl) => {
      console.log(`pull${i}`);
      ctrl.enqueue(i);
      ++i < 10 || ctrl.close();
    },
  });
  const ws = new WritableStream(
    {
      write: (chunk, ctrl) => {
        ctrl.error(new CacheHitError("Cache hit when stream start"));
        console.log("write chunk: ", chunk);
      },
    },
    { highWaterMark: 1 },
  );
  await rs.pipeTo(ws).catch(CacheHitError.nil);

  console.log("done");
});
