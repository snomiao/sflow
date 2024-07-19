import { sflow } from ".";
import { riffles } from "./riffles";
it("riffles", async () => {
  const out = await sflow(["a", "b", "c"]).through(riffles("\n")).text();
  console.log(out);
  expect(out).toEqual("a\nb\nc\n");
});

