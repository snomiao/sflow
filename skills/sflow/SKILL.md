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

## Anti-Patterns sflow Replaces

### 1. Manual async for-loops with sequential await

```typescript
// BAD: sequential, no concurrency, no backpressure
const results = [];
for (const id of ids) {
  const user = await fetchUser(id); // one at a time
  if (user.active) results.push(user);
}

// GOOD: concurrent, lazy, backpressure-aware
const results = await sflow(ids)
  .map(fetchUser, { concurrency: 5 })
  .filter((u) => u.active)
  .toArray();
```

### 2. Promise.all buffering entire datasets in memory

```typescript
// BAD: loads ALL results into memory at once, no concurrency limit
const users = await Promise.all(ids.map(fetchUser));
const active = users.filter((u) => u.active);

// GOOD: streams results lazily, bounded concurrency
const active = await sflow(ids)
  .map(fetchUser, { concurrency: 16 })
  .filter((u) => u.active)
  .toArray();
```

### 3. Accumulating arrays then re-iterating

```typescript
// BAD: materializes full array at each step
const raw = await getAllRecords();
const parsed = raw.map(parse);
const filtered = parsed.filter(isValid);
const grouped = chunk(filtered, 100);
for (const batch of grouped) await sendBatch(batch);

// GOOD: single lazy pipeline, constant memory
await sflow(getRecordStream())
  .map(parse)
  .filter(isValid)
  .chunk(100)
  .forEach(sendBatch)
  .run();
```

### 4. Hand-rolled chunking / batching

```typescript
// BAD: imperative, error-prone, hard to maintain
const batches = [];
for (let i = 0; i < items.length; i += 100) {
  batches.push(items.slice(i, i + 100));
}

// GOOD: declarative
await sflow(items).chunk(100).forEach(processBatch).run();
```

### 5. Unbounded concurrency (OOM / rate-limit risk)

```typescript
// BAD: fires ALL requests at once — crashes with large input
await Promise.all(urls.map((u) => fetch(u)));

// GOOD: bounded, backpressure-aware
await sflow(urls).map((u) => fetch(u), { concurrency: 8 }).run();
```

### 6. Callback-based event processing

```typescript
// BAD: callback hell, no composition
emitter.on("data", (d) => {
  transform(d, (err, result) => {
    if (!err) save(result, () => {});
  });
});

// GOOD: composable async pipeline
await sflow(eventStream)
  .map(transform)
  .forEach(save)
  .run();
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
