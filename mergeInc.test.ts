import console from "console";
import { mergeIncs, snoflow } from ".";
// todo fix it
it.skip("merge inc", async () => {
  const req1 = snoflow([0, 1, 2]);
  const req2 = snoflow([1, 2, 3]);
  const req3 = snoflow([0, 4, 5]);
  const ret = [0, 0, 1, 1, 2, 2, 3, 4, 5];

  expect(
    await mergeIncs((x) => x, req1, req2)
      .peek(console.log)
      .toArray()
  ).toEqual(ret);
});
