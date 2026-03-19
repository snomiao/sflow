import { it, expect } from "bun:test";
import { sortBy, deepEquals } from "./utils";

it("sortBy sorts array by key function", () => {
  const result = sortBy((x: number) => x, [3, 1, 4, 1, 5, 9, 2, 6]);
  expect(result).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
});

it("sortBy sorts array by string key", () => {
  const items = [{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }];
  const result = sortBy((x) => x.name, items);
  expect(result.map((x) => x.name)).toEqual(["Alice", "Bob", "Charlie"]);
});

it("sortBy handles equal elements", () => {
  const result = sortBy((x: number) => x, [2, 2, 1]);
  expect(result).toEqual([1, 2, 2]);
});

it("deepEquals returns true for equal primitives", () => {
  expect(deepEquals(1, 1)).toBe(true);
  expect(deepEquals("hello", "hello")).toBe(true);
  expect(deepEquals(null, null)).toBe(true);
});

it("deepEquals returns false for different primitives", () => {
  expect(deepEquals(1, 2)).toBe(false);
  expect(deepEquals("a", "b")).toBe(false);
});

it("deepEquals returns false for null vs non-null", () => {
  expect(deepEquals(null, 1)).toBe(false);
  expect(deepEquals(1, null)).toBe(false);
});

it("deepEquals returns false for different types", () => {
  expect(deepEquals(1, "1")).toBe(false);
});

it("deepEquals compares arrays deeply", () => {
  expect(deepEquals([1, 2, 3], [1, 2, 3])).toBe(true);
  expect(deepEquals([1, 2], [1, 2, 3])).toBe(false);
  expect(deepEquals([1, 2, 3], [1, 2, 4])).toBe(false);
});

it("deepEquals compares objects deeply", () => {
  expect(deepEquals({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  expect(deepEquals({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  expect(deepEquals({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  expect(deepEquals({ a: 1 }, { a: 2 })).toBe(false);
});

it("deepEquals handles non-array vs array", () => {
  expect(deepEquals([1, 2], { 0: 1, 1: 2 })).toBe(false);
});
