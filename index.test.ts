// snoflow

import { nils, snoflow } from ".";
it.skip("pmaps", async () => {
  let step = 0;
  const t = Date.now();
  const p = snoflow([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].toReversed())
    .pMap(3, async (n) => {
      console.log("s", n, Date.now() - t);
      await new Promise((r) => setTimeout(r, n * 100));
      console.log("e", n, Date.now() - t);
      return n;
    })
    .peek((n) => console.log("step", step++, n, Date.now() - t))
    .done();
});

it.skip("survives", async () => {
  let step = 0;
  await snoflow([1, 2, 3])
    .buffer(2)
    .peek((n) => console.log("step", step++, n))
    .debounce(100)
    .peek((n) => console.log("step", step++, n))
    .filter()
    .peek((n) => console.log("step", step++, n))
    .map((n) => [String(n)])
    .peek((n) => console.log("step", step++, n))
    .flat()
    .peek((n) => console.log("step", step++, n))
    .flatMap((n) => [String(n)])
    .peek((n) => console.log("step", step++, n))
    .tees((s) => s.pipeTo(nils()))
    .peek((n) => console.log("step", step++, n))
    .limit(1)
    .peek((n) => console.log("step", step++, n))
    .map(() => 1)
    .peek((n) => console.log("step", step++, n))
    .peek(() => {})
    .peek((n) => console.log("step", step++, n))
    .reduce(0, (a, b) => a + b)
    .peek((n) => console.log("step", step++, n))
    .skip(1)
    .peek((n) => console.log("step", step++, n))
    .tail(1)
    .peek((n) => console.log("step", step++, n))
    .throttle(100)
    .peek((n) => console.log("step", step++, n))
    .done();
});
