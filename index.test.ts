// snoflow
import { nils, snoflow } from ".";

it("async iteratable", async () => {
  const req = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const acc = [];
  for await (const iterator of snoflow(req)) {
    acc.push(iterator);
  }
  expect(req).toEqual(acc);
});
it("pmaps", async () => {
  const t = Date.now();
  const req = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const acc = snoflow(req.toReversed())
    .pMap(3, async (n) => {
      await new Promise((r) => setTimeout(r, n * 100));
      return n;
    })
    .toArray();
  expect(acc).resolves.toEqual(req.toReversed());
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
