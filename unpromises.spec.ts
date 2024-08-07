import { sf } from "./index";
import { sflow } from "./sflow";
import { unpromises } from "./unpromises";

it("works", async () => {
  const p = getStream();
  expect(p).toBeInstanceOf(Promise);
  expect(await sf(unpromises(p)).toArray()).toEqual([1, 2, 3]);
});
async function getStream() {
  return sflow([1, 2, 3]);
}
