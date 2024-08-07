import { sf } from "./index";
import { lines } from "./lines";

it("split string stream into lines stream", async () => {
  expect(
    await sf("a,b,c\n1,2,3\n\nd,s,f".split(""))
      .through(lines({ EOL: "NONE" }))
      .toArray()
  ).toEqual(["a,b,c", "1,2,3", "", "d,s,f"]);
  expect(
    await sf("a,b,c\n1,2,3\n\nd,s,f")
      .through(lines({ EOL: "NONE" }))
      .toArray()
  ).toEqual(["a,b,c", "1,2,3", "", "d,s,f"]);
  expect(
    await sf(["a,b,c\n1,", "2,3\n\nd,s,f"]).lines({ EOL: "NONE" }).toArray()
  ).toEqual(["a,b,c", "1,2,3", "", "d,s,f"]);
});

it("Change EOL", async () => {
  expect(
    await sf("a,b,c\n1,2,3\n\nd,s,f".split(""))
      .through(lines({ EOL: "LF" }))
      .toArray()
  ).toEqual(["a,b,c\n", "1,2,3\n", "\n", "d,s,f\n"]);

  expect(
    await sf("a,b,c\n1,2,3\n\nd,s,f".split(""))
      .through(lines({ EOL: "CRLF" }))
      .toArray()
  ).toEqual(["a,b,c\r\n", "1,2,3\r\n", "\r\n", "d,s,f\r\n"]);

  expect(
    await sf("a,b,c\n1,2,3\n\r\nd,s,f".split(""))
      .through(lines({ EOL: "KEEP" }))
      .toArray()
  ).toEqual(["a,b,c\n", "1,2,3\n", "\r\n", "d,s,f"]);
  
  expect(
    await sf("a,b,c\n1,2,3\n\r\nd,s,f\n".split(""))
      .through(lines({ EOL: "KEEP" }))
      .toArray()
  ).toEqual(["a,b,c\n", "1,2,3\n", "\r\n", "d,s,f\n"]);
});
