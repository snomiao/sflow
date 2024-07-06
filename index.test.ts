// snoflow
import { snoflow } from "./snoflow";
import { nils } from "./nils";

it("async iteratable", async () => {
  const req = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const acc = [];
  for await (const iterator of snoflow(req)) {
    acc.push(iterator);
  }
  expect(req).toEqual(acc);
});

it("works", async () => {
  await snoflow([1, 2, 3])
    .buffer(2)
    .debounce(100)
    .filter()
    .map((n) => [String(n)])
    .flat()
    .flatMap((n) => [String(n)])
    .tees((s) => s.pipeTo(nils()))
    .limit(1)
    .map(() => 1)
    .peek(() => {})
    .reduce(0, (a, b) => a + b)
    .skip(1)
    .tail(1)
    .throttle(100)
    .done();
});
