import { bys } from "./bys";
import { sflow } from "./index";
import { sleep } from "./utils";

it("should return a transform stream when no argument is provided", async () => {
  const transform = bys();
  expect(transform).toBeInstanceOf(TransformStream);
  expect(
    await sflow(sflow([1, 2, 3]).pipeThrough(transform)).toArray()
  ).toEqual([1, 2, 3]);
});

it("should handle a transform stream as argument", async () => {
  // Create a transform stream that doubles each value
  const doubler = new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(chunk * 2);
    },
  });

  const transform = bys(doubler);

  // Test the transformation
  const writer = transform.writable.getWriter();
  const reader = transform.readable.getReader();
  (async function () {
    await writer.write(1);
    await writer.write(2);
    await writer.write(3);
    await writer.close();
  })();

  const results = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    results.push(value);
  }

  expect(results).toEqual([2, 4, 6]);
});

it("should handle a function as argument", async () => {
  // Create a function that triples each value
  const tripler = (readable: ReadableStream<number>) => {
    const transform = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk * 3);
      },
    });
    return readable.pipeThrough(transform);
  };

  const transform = bys(tripler);

  // Test the transformation
  const writer = transform.writable.getWriter();
  const reader = transform.readable.getReader();
  (async function () {
    await writer.write(1);
    await writer.write(2);
    await writer.write(3);
    await writer.close();
  })();
  const results = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    results.push(value);
  }

  expect(results).toEqual([3, 6, 9]);
});

it("should handle async function transformation", async () => {
  // Create a function that returns a promise of a stream
  const asyncTransformer = async (readable: ReadableStream<number>) => {
    await sleep(50); // Simulate async operation
    const transform = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk * 4);
      },
    });
    return readable.pipeThrough(transform);
  };

  const transform = bys(asyncTransformer);

  // Test the transformation
  const writer = transform.writable.getWriter();
  const reader = transform.readable.getReader();
  (async function () {
    await writer.write(1);
    await writer.write(2);
    await writer.write(3);
    await writer.close();
  })();

  const results = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    results.push(value);
  }

  expect(results).toEqual([4, 8, 12]);
});

it("should work with sflow integration", async () => {
  const result = await sflow([1, 2, 3])
    .by(
      bys((readable) => {
        const transform = new TransformStream({
          transform(chunk, controller) {
            controller.enqueue(chunk * 5);
          },
        });
        return readable.pipeThrough(transform);
      })
    )
    .toArray();

  expect(result).toEqual([5, 10, 15]);
});

it("should handle when input is already a stream without promise", async () => {
  // Create a readable stream directly
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(1);
      controller.enqueue(2);
      controller.enqueue(3);
      controller.close();
    },
  });

  // Function that uses the stream directly (no promise)
  const directStreamTransformer = (readable: ReadableStream<number>) => {
    const transform = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk * 10);
      },
    });
    return readable.pipeThrough(transform);
  };

  const transform = bys(directStreamTransformer);

  // Pipe our direct stream through the transformer
  const result = await sflow(stream).by(transform).toArray();

  expect(result).toEqual([10, 20, 30]);
});
