import { sflow } from ".";
import { riffles } from "./riffles";
it("riffles string", async () => {
  const out = await sflow(["a", "b", "c"]).through(riffles("\n")).text();
  console.log(out);
  expect(out).toEqual("a\nb\nc");
});

it("riffles number", async () => {
  const out = await sflow([1, 2, 3]).through(riffles(0)).toArray();
  console.log(out);
  expect(out).toEqual([1, 0, 2, 0, 3]);
});
''.match
it("riffles mixed types", async () => {
  const out = await sflow<string|number>([1, 2, 3])
    .through(riffles(','))
    .toArray();
  console.log(out);
  expect(out).toEqual([1, ',', 2, ',', 3]);
});
