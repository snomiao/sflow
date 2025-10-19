import { sflow } from "./index";
import { sleep } from "./utils";

/* wip */

it("eager", () => {
  sflow(
    new ReadableStream({
      start: (ctrl) => {
        ctrl.enqueue(1);
        ctrl.enqueue(2);
        ctrl.enqueue(3);
        ctrl.close();
      },
    }),
  ).pipeTo(new WritableStream({ write: (c) => console.log(c) }));
});

it.skip("passive", () => {
  let i = 0;
  sflow(
    new ReadableStream({
      pull: (ctrl) => {
        console.log("pulling", i);
        ctrl.enqueue(i++);
      },
    }),
  ).pipeTo(
    new WritableStream(
      {
        start: (e) => {
          e.signal;
        },
        write: async (_c, _ctrl) => {
          await sleep(10);
        },
      },
      { highWaterMark: 2 },
    ),
  );
});
