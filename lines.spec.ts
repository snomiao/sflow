import { sf } from ".";
import { lines } from "./lines";

it("split string stream into lines stream", async () => {
  expect(
    await sf("a,b,c\n1,2,3\n\nd,s,f".split("")).through(lines()).toArray()
  ).toEqual(["a,b,c", "1,2,3", "", "d,s,f"]);
  expect(await sf("a,b,c\n1,2,3\n\nd,s,f").through(lines()).toArray()).toEqual([
    "a,b,c",
    "1,2,3",
    "",
    "d,s,f",
  ]);
  expect(await sf(["a,b,c\n1,", "2,3\n\nd,s,f"]).lines().toArray()).toEqual([
    "a,b,c",
    "1,2,3",
    "",
    "d,s,f",
  ]);
});
