import console from "console";
import { snoflow } from ".";
import { mergeAscends } from "./mergeAscends";
// todo fix it
it("merge asc", async () => {
  const req1 = snoflow([0, 1, 2]);
  const req2 = snoflow([1, 2, 3]);
  const req3 = snoflow([0, 4, 5]);
  const ret = [0, 0, 1, 1, 2, 2, 3, 4, 5];

  expect(
    await mergeAscends((x) => x, req1, req2, req3)
      .peek(console.log)
      .toArray()
  ).toEqual(ret);
});

it("not throws asc", async () => {
  const req1 = snoflow([1, 2, 3]);
  const req2 = snoflow([0, 4, 5]);
  expect(
    await mergeAscends((x) => x, req1, req2)
      .peek(console.log)
      .toArray()
  ).toEqual([0, 1, 2, 3, 4, 5]);
});
it("throws not asc", async () => {
  const req1 = snoflow([1, 2, 0]); // not asc
  const req2 = snoflow([0, 4, 5]);
  expect(() =>
    mergeAscends((x) => x, req1, req2)
      .peek(console.log)
      .toArray()
  ).toThrow(/ascending/);
});
