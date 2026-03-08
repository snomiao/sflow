---
name: sflow
description: Use sflow for TypeScript stream processing pipelines. Trigger this skill when the user needs to process arrays, async iterables, or streams with operations like map, filter, reduce, chunk, merge, debounce, throttle, or any functional pipeline over data. sflow wraps WebStreams API with a chainable, async-first API that handles concurrency, backpressure, and lazy evaluation automatically. Use it instead of hand-rolled for-loops, Promise.all chains, or RxJS when building data pipelines in TypeScript/JavaScript.
---

# sflow — TypeScript Stream Processing

sflow is a chainable, async-first stream processing library built on the WebStreams API.

Install: `npm install sflow` or `bun add sflow`

## Core Pattern

```typescript
import { sflow } from "sflow";

const result = await sflow(source)  // wrap any source
  .map(fn)                          // transform (sync or async)
  .filter(fn)                       // filter (sync or async)
  .toArray();                       // collect result
```

## Sources

```typescript
sflow([1, 2, 3])                    // array
sflow(asyncGenerator())             // async iterable / generator
sflow(promise)                      // promise resolving to array
sflow(readableStream)               // ReadableStream
sflow(src1, src2, src3)             // multiple sources (concatenated)
```

## Key Operations

**Transform:** `.map(fn)` `.filter(fn)` `.flatMap(fn)` `.reduce(fn, init)` `.flat()`

**Chunk/Buffer:** `.chunk(n)` `.chunkBy(fn)` `.chunkIf(fn)` `.chunkInterval(ms)` `.convolve(n)`

**Control flow:** `.limit(n)` `.skip(n)` `.head(n)` `.tail(n)` `.slice(s,e)` `.takeWhile(fn)` `.find(fn)` `.uniq()` `.uniqBy(fn)`

**Rate control:** `.throttle(ms)` `.debounce(ms)`

**Side effects:** `.log()` `.peek(fn)` `.forEach(fn)`

**Merge/fork:** `.merge(stream)` `.concat(stream)` `.fork()` `.forkTo(fn)` `.through(fn)`

**Object ops:** `.mapAddField(key, fn)` `.mapMixin(fn)` `.unwind(key)`

**Text ops:** `.lines()` `.match(re)` `.matchAll(re)` `.replace(re, fn)` `.replaceAll(re, fn)`

**Terminal:** `.toArray()` `.toFirst()` `.toLast()` `.toCount()` `.toFirstMatch(fn)` `.run()`

## Concurrency

All async `.map()`, `.filter()`, `.forEach()` accept a concurrency option:

```typescript
// Process up to 5 items concurrently
await sflow(ids).map(fetchUser, { concurrency: 5 }).toArray();
```

## Async Iteration

```typescript
for await (const item of sflow(source).map(fn)) {
  console.log(item);
}
```

## Detailed Examples

See [examples.md](./examples.md) for real-world scenarios:
- API data fetching pipelines
- CSV/log file processing
- Real-time event streams
- Parallel processing with concurrency control
- Object transformation (mapAddField, unwind)
- Stream merging and forking
- Chunked batch processing
- Text stream processing
