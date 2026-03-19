import { it, expect } from "bun:test";
import { andIgnoreError } from "./andIgnoreError";

it("returns null when error message matches regex", () => {
  const handler = andIgnoreError(/not found/i);
  const result = handler(new Error("resource not found"));
  expect(result).toBeNull();
});

it("returns null when error message matches string", () => {
  const handler = andIgnoreError("timeout");
  const result = handler(new Error("connection timeout"));
  expect(result).toBeNull();
});

it("re-throws error when message does not match", () => {
  const handler = andIgnoreError(/not found/i);
  expect(() => handler(new Error("permission denied"))).toThrow("permission denied");
});

it("handles error objects without message property gracefully", () => {
  const handler = andIgnoreError(/anything/);
  // no message, so won't match, should re-throw
  expect(() => handler({ code: 404 })).toThrow();
});
