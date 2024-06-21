// snoflow

import { nils, snoflow } from ".";

it("survives", async () => {
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
