import { expect, it, describe } from "vitest";
import { finds } from "./finds";
import { sflow } from "./sflow";

describe("finds standalone", () => {
  it("should work as a standalone transform stream", async () => {
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue(1);
        controller.enqueue(2);
        controller.enqueue(3);
        controller.enqueue(4);
        controller.enqueue(5);
        controller.close();
      }
    });

    const result = await sflow(
      source.pipeThrough(finds((x: number) => x > 3))
    ).toArray();

    expect(result).toEqual([4]);
  });

  it("should work with multiple transform streams", async () => {
    const result = await sflow([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .map(x => x * 2)  // [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
      .by(finds((x: number) => x > 10))  // finds first > 10
      .toArray();

    expect(result).toEqual([12]);
  });
});
