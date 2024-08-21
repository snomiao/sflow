import { sf } from ".";
import { sfTemplate } from "./sfTemplate";
it("works", async () => {
  expect(await sfTemplate`hello ${sf("asdf")} zxcv`.text()).toBe(
    "hello asdf zxcv"
  );
});
it("multi", async () => {
  expect(
    await sfTemplate`hello ${sf("asdf")} ${sf("asdf")} ${sf(
      "asdf"
    )} zxcv`.text()
  ).toBe("hello asdf asdf asdf zxcv");
});
it("nest", async () => {
  expect(
    await sfTemplate`hello ${await sfTemplate`nested ${sf("stream1")} ${sf(
      "stream2"
    )} ${sf("stream3")} zxcv`.text()} ${sf("asdf")} end`.text()
  ).toBe("hello nested stream1 stream2 stream3 zxcv asdf end");
});
