# sflow Examples — Real-World Scenarios

## 1. API Data Fetching Pipeline

Fetch paginated API results with concurrency control and filtering:

```typescript
import { sflow } from "sflow";

// Fetch active users from paginated API
const activeUsers = await sflow([1, 2, 3, 4, 5])  // page numbers
  .map(async (page) => {
    const res = await fetch(`/api/users?page=${page}`);
    return res.json() as Promise<User[]>;
  })
  .flat()                                           // flatten pages into items
  .filter(async (user) => {
    const status = await fetch(`/api/users/${user.id}/status`);
    return (await status.json()).active;
  }, { concurrency: 10 })                           // check 10 statuses in parallel
  .map((user) => ({ ...user, fetchedAt: Date.now() }))
  .toArray();
```

---

## 2. CSV / Log File Processing

Parse and analyze a large CSV or log file line by line:

```typescript
import { sflow } from "sflow";

// Parse CSV stream into typed records
const records = await sflow(fetchTextStream("/data/records.csv"))
  .lines()                                          // split into lines
  .skip(1)                                          // skip header row
  .filter((line) => line.trim().length > 0)         // remove empty lines
  .map((line) => {
    const [id, name, value, date] = line.split(",");
    return { id: Number(id), name, value: parseFloat(value), date: new Date(date) };
  })
  .filter((row) => row.value > 100)                 // business filter
  .toArray();

// Count error lines in a log file
const errorCount = await sflow(fetchTextStream("/logs/app.log"))
  .lines()
  .filter((line) => line.includes("[ERROR]"))
  .toCount();

// Extract all unique IPs from access log
const uniqueIPs = await sflow(fetchTextStream("/logs/access.log"))
  .lines()
  .matchAll(/\d+\.\d+\.\d+\.\d+/)                  // regex match
  .map(([match]) => match)
  .uniq()
  .toArray();
```

---

## 3. Real-Time Event Stream Processing

Process a live WebSocket or SSE stream with debouncing and batching:

```typescript
import { sflow } from "sflow";

// Process sensor readings with debounce and batch
async function* readSensor() {
  while (true) {
    yield await getSensorReading();
  }
}

const pipeline = sflow(readSensor())
  .debounce(100)                                    // ignore bursts within 100ms
  .chunkInterval(5000)                              // batch into 5-second windows
  .map(async (batch) => {
    const avg = batch.reduce((sum, v) => sum + v, 0) / batch.length;
    await saveToDatabase({ timestamp: Date.now(), average: avg, count: batch.length });
    return avg;
  })
  .log();                                           // print each batch average

await pipeline.run();

// Process SSE stream from AI provider (chunked tokens → complete lines)
const output = await sflow(fetchSSEStream("/api/chat"))
  .map((chunk) => chunk.choices[0]?.delta?.content ?? "")
  .filter(Boolean)
  .chunkIf((token) => !token.endsWith("\n"))        // accumulate until newline
  .map((tokens) => tokens.join(""))
  .toArray();
```

---

## 4. Parallel Processing with Concurrency Control

Process work items in parallel without overwhelming downstream services:

```typescript
import { sflow } from "sflow";

// Resize images with controlled parallelism
const results = await sflow(imageIds)
  .map(async (id) => {
    const image = await downloadImage(id);
    const resized = await sharp(image).resize(800, 600).toBuffer();
    await uploadImage(id, resized);
    return { id, success: true };
  }, { concurrency: 4 })                            // 4 concurrent uploads
  .toArray();

// Retry failed items
const processed = await sflow(tasks)
  .map(async (task) => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await processTask(task);
      } catch (e) {
        if (attempt === 3) throw e;
        await new Promise(r => setTimeout(r, attempt * 1000));
      }
    }
  }, { concurrency: 8 })
  .filter(Boolean)
  .toArray();
```

---

## 5. Object Transformation (mapAddField / unwind)

Enrich and restructure objects in a pipeline:

```typescript
import { sflow } from "sflow";

// Add computed fields to objects
const enriched = await sflow(orders)
  .mapAddField("total", (order) => order.items.reduce((s, i) => s + i.price, 0))
  .mapAddField("tax",   (order) => order.total * 0.08)
  .mapAddField("label", async (order) => await translateLabel(order.status))
  .filter((order) => order.total > 50)
  .toArray();

// MongoDB-style unwind: flatten nested arrays
const flat = await sflow([
  { userId: 1, tags: ["admin", "editor"] },
  { userId: 2, tags: ["viewer"] },
])
  .unwind("tags")
  // → { userId: 1, tags: "admin" }
  // → { userId: 1, tags: "editor" }
  // → { userId: 2, tags: "viewer" }
  .filter((row) => row.tags !== "viewer")
  .toArray();

// Mix in extra properties
const withMeta = await sflow(users)
  .mapMixin(async (user) => ({
    avatar: await fetchAvatar(user.id),
    role:   await fetchRole(user.id),
  }))
  .toArray();
```

---

## 6. Stream Merging and Forking

Combine or split streams for fan-in / fan-out patterns:

```typescript
import { sflow } from "sflow";

// Merge multiple async sources (interleaved as results arrive)
const all = await sflow([
  fetchFromDatabaseA(),
  fetchFromDatabaseB(),
  fetchFromCache(),
]).confluence().toArray();                          // parallel merge

// Concatenate streams (ordered, one after another)
const sequential = await sflow(page1Stream, page2Stream, page3Stream).toArray();

// Fork: write to DB and send to analytics simultaneously
await sflow(events)
  .forkTo(async (stream) => {
    for await (const event of stream) {
      await analytics.track(event);
    }
  })
  .forEach(async (event) => {
    await db.insert(event);
  });

// Merge two sorted streams (preserving order)
const merged = await sflow([streamA, streamB])
  .confluenceByAscend((item) => item.timestamp)
  .toArray();
```

---

## 7. Chunked Batch Processing

Process items in batches for efficient bulk operations:

```typescript
import { sflow } from "sflow";

// Bulk insert in batches of 100
await sflow(largeDataset)
  .chunk(100)
  .map(async (batch) => {
    await db.bulkInsert(batch);
    console.log(`Inserted ${batch.length} rows`);
  })
  .run();

// Group events by type then process each group
const grouped = await sflow(events)
  .chunkBy((event) => event.type)                  // group consecutive same-type events
  .map(async (group) => ({
    type: group[0].type,
    count: group.length,
    processed: await processBatch(group),
  }))
  .toArray();

// Sliding window analysis (overlapping chunks)
const windows = await sflow(timeseries)
  .convolve(5)                                      // rolling window of 5
  .map((window) => ({
    avg: window.reduce((s, v) => s + v, 0) / window.length,
    max: Math.max(...window),
    min: Math.min(...window),
  }))
  .toArray();
```

---

## 8. Text Stream Processing

Handle streaming text, tokenization, and transformation:

```typescript
import { sflow } from "sflow";

// Stream LLM output token-by-token, collect into sentences
const sentences = await sflow(llmTokenStream)
  .chunkIf((token) => !/[.!?]/.test(token))        // split at sentence boundaries
  .map((tokens) => tokens.join("").trim())
  .filter(Boolean)
  .toArray();

// Replace sensitive patterns in a text stream
const sanitized = await sflow(textChunks)
  .replaceAll(/\b\d{4}-\d{4}-\d{4}-\d{4}\b/g, () => "[REDACTED]")
  .replaceAll(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, () => "[EMAIL]")
  .toArray();

// Count word frequencies from a document stream
const freq = await sflow(fetchTextStream("/docs/article.txt"))
  .lines()
  .flatMap((line) => line.toLowerCase().match(/\w+/g) ?? [])
  .reduce((counts: Record<string, number>, word) => {
    counts[word] = (counts[word] ?? 0) + 1;
    return counts;
  }, {})
  .toArray();
// → [{ the: 142, of: 98, and: 87, ... }]
```

---

## 9. Rate Limiting and Throttling

Control emission rate for APIs with rate limits:

```typescript
import { sflow } from "sflow";

// Stay within API rate limit (max 10 requests/second)
const results = await sflow(apiRequests)
  .throttle(100)                                    // one per 100ms = 10/sec
  .map(async (req) => {
    const res = await fetch(req.url, req.options);
    return res.json();
  })
  .toArray();

// Deduplicate rapid user input changes
sflow(userInputEvents)
  .debounce(300)                                    // wait 300ms of silence
  .map(async (query) => searchAPI(query))
  .forEach(updateUI);
```

---

## 10. Collecting and Inspecting

Terminal operations to extract values:

```typescript
import { sflow } from "sflow";

const stream = sflow(data).filter(isValid).map(transform);

// Various ways to collect
const arr    = await stream.toArray();              // all items
const first  = await stream.toFirst();             // first item
const last   = await stream.toLast();              // last item
const count  = await stream.toCount();             // count only
const match  = await stream.toFirstMatch(pred);   // first matching

// Debug intermediate steps
await sflow(data)
  .log()                                            // prints each item
  .map(transform)
  .peek((v) => metrics.record(v))                  // side-effect, passes through
  .filter(isValid)
  .log("after filter:")                             // labeled log
  .toArray();
```
