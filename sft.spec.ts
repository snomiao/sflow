import { sf } from ".";
import { sfTemplate } from "./sft";
it("works", async () => {
  expect(await sfTemplate`hello ${sf("asdf")} zxcv`.text()).toBe("hello asdf zxcv");
});
