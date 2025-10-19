import { chunkIfs } from "./chunkIfs";
import { sflow } from "./index";

it("chunkIfs", async () => {
  const out = await sflow("a,b,c\n\n1,2,3\nd,s,f".split(""))
    .through(chunkIfs((e: string) => e.indexOf("\n") === -1))
    .map((chars) => chars.join(""))
    .toArray();
  expect(out).toEqual(["a,b,c", "\n", "\n", "1,2,3", "\n", "d,s,f"]);
});
