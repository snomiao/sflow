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
