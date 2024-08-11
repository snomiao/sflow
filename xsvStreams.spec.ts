import { mergeAscends } from "./mergeAscends";
import { rangeFlow } from "./rangeStream";
import { sflow } from "./sflow";
import { csvParses, tsvFormats } from "./xsvStreams";
it("reads", async () => {
  expect(await controlFlow().log().toCount()).toEqual(5);
});
it("works", async () => {
  expect(
    await sflow([
      // control signal must be first
      controlFlow(),
      // ticker flow
      rangeFlow(0, 15).map((t) => ({ t: String(t), a: "0", remark: "" })),
    ])
      .chunk()
      .map(mergeAscends((e) => +e.t))
      .confluence()
      .uniqBy((e) => e.t)
      .map((e) => ({ ...e, a: +e.a, t: +e.t })) // resolve to correct type
      .map((e) => ({ ...e, x: 0, v: 0 })) // add speed placeholder
      // accelerate model
      .forEach(
        (function () {
          let x = 0,
            v = 0,
            t = 0,
            dt = 0;
          return (e) => {
            t += dt = e.t - t; // calculate dt
            return (e.x = x += dt * (e.v = v += dt * +e.a)); // calculate motion
          };
        })(),
      )
      // .log((e) => e)
      .through(tsvFormats("t\tx\tv\ta\tremark")) //
      .log((e) => e.trim())
      .text(),
  ).toMatchSnapshot();
});

/** example for motion controller flow */
function controlFlow(): sflow<Record<"t" | "a" | "remark", any>> {
  return sflow([
    "t,a,remark\n0,0,idle\n1,2,push\n10,0,keep\n11,-1,break1\n12,-1,break2",
  ]).through(csvParses("t,a,remark"));
}
