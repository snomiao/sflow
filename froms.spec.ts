import { createReadStream } from "fs";
import { fromReadable } from "./fromNodeStream";
import { sflow } from "./sflow";

it("froms", async () => {
  console.log("froms");
  await sflow(fromReadable(createReadStream("./README.md")))
    .map((buffer) => buffer.toString())
    .lines()
    .riffle(">")
    .toLog();
});

it("read string as array ", async () => {
  const flow = sflow("hello world");
  expect(await flow.toArray()).toEqual([
    "h",
    "e",
    "l",
    "l",
    "o",
    " ",
    "w",
    "o",
    "r",
    "l",
    "d",
  ]);
});
it("read string array as array", async () => {
  const flow = sflow(["hello world"]);
  expect(await flow.toArray()).toEqual(["hello world"]);
});
