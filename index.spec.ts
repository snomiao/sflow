// snoflow
import { nils, sflow } from ".";

it("async iteratable", async () => {
  const req = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const acc = [];
  for await (const iterator of sflow(req)) {
    acc.push(iterator);
  }
  expect(req).toEqual(acc);
});
it("string stream", async () => {
  expect(
    await sflow(["asdf"])
      .map((e) => e.replace("asdf", "zxcv"))
      .toOne()
  ).toEqual("zxcv");
});

it("works", async () => {
  await sflow([1, 2, 3])
    .buffer(2)
    .debounce(100)
    .filter()
    .map((n) => [String(n)])
    .flat()
    .flatMap((n) => [String(n)])
    .tees((s) => s.pipeTo(nils())) // Warn: read a flow with different speed may cause memory leak
    .limit(1)
    .map(() => 1)
    .peek(() => {})
    .reduce((a, b) => a + b, 0)
    .skip(1)
    .tail(1)
    .throttle(100)
    .done();
});
it("works", async () => {
  expect(
    await sflow([1, 2, 3, 4])
      .map((n) => n * 2)
      .log() // prints 2, 4, 6, 8
      .filter((n) => n > 4)
      .log() // prints 6, 8
      .reduce((a, b) => a + b, 0)
      .log() // prints 6, 14
      .toArray()
  ).toEqual([6, 14]);
});
