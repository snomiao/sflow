import { writeFile } from "fs/promises";
import { maps, sflow, throughs } from ".";
import { snoflow } from "./sflow";
import { riffles } from "./riffles";
it("riffles", async () => {
  const out = await sflow(["a", "b", "c"]).through(riffles("\n")).text();
  console.log(out);
  expect(out).toEqual("a\nb\nc\n");
});

