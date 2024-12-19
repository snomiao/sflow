import { fromReadable, fromWritable } from "./fromNodeStream";
import { sflow } from "./sflow";

process.stdin.setRawMode(true);

console.log("Type any thing here, you will see echo for each line: ");

const CtrlC = "\u0003";

await sflow(fromReadable(process.stdin))
  .map(String)
  .replace("\r", () => "\n") // stdin emits \r in setRawMode(true), and \n setRawMode(false)
  // interrupt on ctrl+c
  .by(
    new TransformStream({
      transform: (e, c) =>
        e === CtrlC ? c.error("Interrupted by Ctrl+C") : c.enqueue(e),
    })
  )
  .log((char) => JSON.stringify({ char }))
  .lines()
  .log((line) => JSON.stringify({ line }))
  .log((line) => line)
  .pipeTo(fromWritable(process.stdout));

console.log("all done");
