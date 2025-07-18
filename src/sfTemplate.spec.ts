import { sflow } from "./sf";
import { sfTemplate } from "./sfTemplate";

it("works", async () => {
  expect(await sfTemplate`hello ${sflow("asdf")} zxcv`.text()).toBe(
    "hello asdf zxcv"
  );
});

it("multi", async () => {
  expect(
    await sfTemplate`hello ${sflow("asdf")} ${sflow("asdf")} ${sflow(
      "asdf"
    )} zxcv`.text()
  ).toBe("hello asdf asdf asdf zxcv");
});

it("nest", async () => {
  expect(
    await sfTemplate`hello ${await sfTemplate`nested ${sflow("stream1")} ${sflow(
      "stream2"
    )} ${sflow("stream3")} zxcv`.text()} ${sflow("asdf")} end`.text()
  ).toBe("hello nested stream1 stream2 stream3 zxcv asdf end");
});
