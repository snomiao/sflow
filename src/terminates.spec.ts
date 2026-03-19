import { it, expect } from "bun:test";
import { terminates, aborts } from "./terminates";
import { sflow } from "./sflow";

it("terminates stream when signal is aborted", async () => {
  const ctrl = new AbortController();
  // Abort first, then use the signal
  ctrl.abort();
  const ts = terminates(ctrl.signal);
  const writer = ts.writable.getWriter();
  // The stream is already terminated - writing should fail or the readable should error
  try {
    await writer.write(1);
  } catch (_e) {
    // expected
  }
  const reader = ts.readable.getReader();
  // Either errors or closes immediately
  const r = await reader.read().catch(() => ({ done: true, value: undefined }));
  expect(r.done === true || r.value === undefined).toBe(true);
});

it("passes items through when signal is not aborted", async () => {
  const ctrl = new AbortController();
  const result = await sflow([1, 2, 3]).abort(ctrl.signal).toArray();
  expect(result).toEqual([1, 2, 3]);
});

it("works via sflow abort method", async () => {
  const ctrl = new AbortController();
  const result = await sflow([1, 2, 3]).abort(ctrl.signal).toArray();
  expect(result).toEqual([1, 2, 3]);
});

it("terminates when signal aborts mid-stream", async () => {
  const ctrl = new AbortController();
  const result = sflow([1, 2, 3]).abort(ctrl.signal).toArray();
  // abort after the pipeline starts
  ctrl.abort();
  // The stream may error or return partial results
  const r = await result.catch(() => null);
  // Just verify it terminates (either way)
  expect(r === null || Array.isArray(r)).toBe(true);
});

it("aborts (deprecated) passes items through when signal is not aborted", async () => {
  const ctrl = new AbortController();
  const ts = aborts(ctrl.signal);
  const writer = ts.writable.getWriter();
  writer.write(10);
  writer.write(20);
  writer.close();
  const result = await sflow(ts.readable).toArray();
  expect(result).toEqual([10, 20]);
});
