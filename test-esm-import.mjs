// Test ESM import from dist
import sflow from "./dist/index.js";

console.log("Testing sflow ESM import...");

// Test basic functionality
const result = await sflow([1, 2, 3, 4, 5])
  .map((x) => x * 2)
  .filter((x) => x > 5)
  .toArray();

console.log("Result:", result);
console.log("✓ ESM import works!");

// Verify expected result
const expected = [6, 8, 10];
const isCorrect = JSON.stringify(result) === JSON.stringify(expected);
console.log(isCorrect ? "✓ Result is correct!" : "✗ Result is incorrect!");

process.exit(isCorrect ? 0 : 1);
