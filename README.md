# sflow - Stream Flow 🚀

sflow is a powerful and highly-extensible library designed for processing and manipulating streams of data effortlessly based on WebStream. **Built for async-first pipelines**, every pipeline method accepts async functions, making it perfect for web applications that handle async I/O operations and need to manage concurrency efficiently. Inspired by the functional programming paradigm, it provides a rich set of utilities for transforming streams, including chunking, filtering, mapping, reducing, among many others. It's a perfect companion for those who work extensively with streams and want to make their data processing pipelines more efficient and concise.

ONLINE DEMO avaliable here! - [sflow online Examples and Use Cases]( https://sflow-examples.vercel.app/ )

📚 **Documentation**: [snomiao/sflow | DeepWiki]( https://deepwiki.com/snomiao/sflow )

## Features

- **Async-first design**: Every pipeline method accepts async functions, enabling seamless async I/O operations and concurrency management for web applications.

- **Chunking and buffering**: Easily divide your stream into chunks based on different criteria such as count, intervals, custom conditions, etc.

- **Transformations**: Map, filter, reduce, and various other transformations to process your stream data.

- **Stream utilities**: Merge, throttle, debounce, and more utilities for advanced stream controls.

- **Error handling**: Prevent or handle errors during stream processing, ensuring robustness.

- **Integration with other libraries**: Seamlessly integrates with tools like `web-streams-extensions`, making it versatile for different streaming needs.

- **TypeScript support**: Fully typed for a richer developer experience and better code quality.

## Get Started

### Installation

Install sflow using npm or bun:

```sh
npm install sflow

# or if you are using bun

bun add sflow
```

### Basic Usage

Here's a basic example of how to use sflow to process a stream:

```typescript
import { sflow } from "sflow";

async function run() {
  let result = await sflow([1, 2, 3, 4])
    .map((n) => n * 2)
    .log() // this stage prints 2, 4, 6, 8
    .filter((n) => n > 4)
    .log() // this stage prints 6, 8
    .reduce((a, b) => a + b, 0) // first emit 0+6=6, second emit 0+6+8=14
    .log() // this stage prints 6, 14
    .toArray();

  console.log(result); // Outputs: [6, 14]
}

await run();
```

### Async Pipeline Example

sflow excels at handling async operations in pipelines - perfect for web applications:

```typescript
import { sflow } from "sflow";

// Example: Fetch user data and process concurrently
async function processUsers() {
  const result = await sflow([1, 2, 3, 4, 5])
    // Every method accepts async functions!
    .map(async (userId) => {
      const response = await fetch(`https://api.example.com/users/${userId}`);
      return response.json();
    })
    .filter(async (user) => {
      // Async filtering for complex checks
      const isActive = await checkUserStatus(user.id);
      return isActive;
    })
    .map(async (user) => {
      // Transform with async operations
      const profile = await enrichUserProfile(user);
      return profile;
    })
    .toArray();

  console.log(result); // Array of processed user profiles
}

async function checkUserStatus(id: number) {
  // Simulate async check
  return id % 2 === 0;
}

async function enrichUserProfile(user: any) {
  // Simulate async enrichment
  return { ...user, enriched: true };
}
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

Transform your flow with various transformation methods. **All methods support async functions:**

```typescript
// Synchronous mapping
flow1.map((n) => n * 2);

// Async mapping - great for API calls, database queries, etc.
flow1.map(async (n) => {
  const data = await fetchData(n);
  return data.value * 2;
});

// Synchronous filtering
flow1.filter((n) => n % 2 === 0);

// Async filtering - perfect for complex validation
flow1.filter(async (n) => {
  const isValid = await validateAsync(n);
  return isValid;
});

// Async reducing
flow1.reduce(async (a, b) => {
  const result = await computeAsync(a, b);
  return result;
}, 0);
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

Try to create your first PR start from here! https://github.dev/snomiao/sflow

2. Join sflow Community by Post Comments here:

- [Welcome to sflow Discussions! · snomiao/sflow · Discussion #2]( https://github.com/snomiao/sflow/discussions/2 )


## References

- [Infinite Streams with Elixir](https://gist.github.com/mgwidmann/5e0cb590f12e2ca239564d07d7c2a572)
- [web-streams-extensions - npm]( https://www.npmjs.com/package/web-streams-extensions )
- [$unwind (aggregation) - MongoDB Manual v7.0]( https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/ )
- [Introducing sflow: A New Era of Web Stream Processing for TypeScript/JavaScript Developers! : r/javascript]( https://www.reddit.com/r/javascript/comments/1exv4we/introducing_sflow_a_new_era_of_web_stream/ )

## License

sflow is released under the MIT License. See the [LICENSE](./LICENSE) file for more details.

---

sflow aims to simplify stream processing and bring functional programming paradigms to modern JavaScript and TypeScript development. Happy streaming! 🚀
