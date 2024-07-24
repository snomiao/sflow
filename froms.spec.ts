import { TextDecoderStream } from ".";
import { sflow } from "./sflow";
it("works", async () => {
  await sflow(Bun.file("./README.md").stream())
    .through(new TextDecoderStream())
    .lines()
    .riffle(">")
    .toLog();
});
