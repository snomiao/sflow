import { sflow } from "./sflow";

await sflow(Bun.file("./README.md").stream())
  .through(new TextDecoderStream())
  .toLog();
