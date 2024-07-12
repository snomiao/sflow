import { sleep } from "bun";
import { snoflow } from "snoflow";

/* wip */

it("eager", () => {
  snoflow(
    new ReadableStream({
      start: (ctrl) => {
        ctrl.enqueue(1);
        ctrl.enqueue(2);
        ctrl.enqueue(3);
        ctrl.close();
      },
    })
  ).pipeTo(new WritableStream({ write: (c) => console.log(c) }));
});
it("passive", () => {
  let i = 0;
  snoflow(
    new ReadableStream({
      pull: (ctrl) => {
        console.log("pulling", i);
        ctrl.enqueue(i++);
      },
    })
  ).pipeTo(
    new WritableStream(
      {
        start: (e) => {
          e.signal;
        },
        write: async (c, ctrl) => {
          await sleep(100);
          console.log(c);
        },
      },
      { highWaterMark: 2 }
    )
  );
});
