# sflow 🚀

sflow is a powerful and highly-extensible library designed for processing and manipulating streams of data effortlessly. Inspired by the functional programming paradigm, it provides a rich set of utilities for transforming streams, including chunking, filtering, mapping, reducing, among many others. It's a perfect companion for those who work extensively with streams and want to make their data processing pipelines more efficient and concise.

## Features

- **Chunking and buffering**: Easily divide your stream into chunks based on different criteria such as count, intervals, custom conditions, etc.
- **Transformations**: Map, filter, reduce, and various other transformations to process your stream data.

- **Stream utilities**: Merge, throttle, debounce, and more utilities for advanced stream controls.

- **Error handling**: Prevent or handle errors during stream processing, ensuring robustness.

- **Integration with other libraries**: Seamlessly integrates with tools like `web-streams-extensions`, making it versatile for different streaming needs.

- **TypeScript support**: Fully typed for a richer developer experience and better code quality.

## Installation

Install sflow using npm or yarn:

```sh
npm install snoflow

# or if you are using yarn

yarn add snoflow
```

## Basic Usage

Here's a basic example of how to use sflow to process a stream:

```typescript
import { sflow } from "sflow";

async function run() {
  let result = await sflow([1, 2, 3, 4])
    .map((n) => n * 2)
    .log() // prints 2, 4, 6, 8
    .filter((n) => n > 4)
    .log() // prints 6, 8
    .reduce((a, b) => a + b, 0) // first emit 0+6, second emit 0+6+8
    .log() // prints 6, 14
    .toArray();

  console.log(result); // Outputs: [6, 14]
}

run();
```

## API Overview

### Initialization

Initialize a flow from various types of data sources:

```typescript
import { sflow } from "sflow";

// From an array
const flow1 = sflow([1, 2, 3, 4]);

// From a promise
const flow2 = sflow(Promise.resolve([1, 2, 3, 4]));

// From an async iterable
async function* asyncGenerator() {
  yield 1;
  yield 2;
  yield 3;
}
const flow3 = sflow(asyncGenerator());
```

### Transformations

Transform your flow with various transformation methods:

```typescript
// Mapping
flow1.map((n) => n * 2);

// Filtering
flow1.filter((n) => n % 2 === 0);

// Reducing
flow1.reduce((a, b) => a + b, 0);
```

### Chunking, Buffering, and Grouping

sflow provides methods for chunking, buffering, and grouping data:

```typescript
// Chunking by count
flow1.chunk(2); // [[1, 2], [3, 4]]

// Buffering within a time interval
flow1.chunkByInterval(1000);

// Custom chunking
flow1.chunkBy((x) => Math.floor(x / 2));
```

### Advanced Utilities

sflow comes with a plethora of utilities to manipulate streams efficiently:

```typescript
// Throttling
flow1.throttle(100);

// Debouncing
flow1.debounce(200);

// Converting to array
flow1.toArray();

// Merging multiple streams
const mergedFlow = sflow([flow1, flow2]).merge();

// Use chunkIf to split tokens by line
await sflow("a,b,c\n\n1,2,3\nd,s,f".split(""))
  .through(chunkIfs((e: string) => e.indexOf("\n") === -1))
  .map((chars) => chars.join(""))
  .toArray(); // ["a,b,c\n",'\n', "1,2,3\n", "d,s,f"]

```

### Type-Safe Enhancements

With TypeScript, sflow ensures your transformations are type-safe:

```typescript
import { sflow } from "sflow";

const typedFlow = sflow([{ a: 1, b: [1, 2, 3] }])
  .unwind("b") // Use `unwind` for objects with nested arrays
  .mapAddField("newField", (item) => item.a + item.b);
```

## Contributing

Contributions to sflow are always welcome! If you have any ideas, suggestions, or bug reports, feel free to open an issue on GitHub or submit a pull request.

## License

sflow is released under the MIT License. See the [LICENSE](./LICENSE) file for more details.

---

sflow aims to simplify stream processing and bring functional programming paradigms to modern JavaScript and TypeScript development. Happy streaming! 🚀
