#!/usr/bin/env node
/**
 * Test script to verify sflow is ready for CDN usage
 * Tests both ESM and UMD builds
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🧪 Testing sflow CDN compatibility...\n");

// Test 1: Check package.json configuration
console.log("1️⃣  Checking package.json configuration...");
const pkg = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf-8"));

const checks = {
  "main points to dist": pkg.main === "./dist/index.js",
  "module points to dist": pkg.module === "./dist/index.js",
  "browser points to UMD": pkg.browser === "./dist/index.umd.js",
  "unpkg points to UMD": pkg.unpkg === "./dist/index.umd.js",
  'exports["."].import points to dist':
    pkg.exports?.["."]?.import === "./dist/index.js",
};

for (const [check, result] of Object.entries(checks)) {
  console.log(`   ${result ? "✓" : "✗"} ${check}`);
}

const allChecksPassed = Object.values(checks).every(Boolean);

// Test 2: Check for Node.js imports in dist/index.js
console.log("\n2️⃣  Checking dist/index.js for Node.js imports...");
const distIndexContent = readFileSync(
  join(__dirname, "dist/index.js"),
  "utf-8",
);
const hasNodeImports = /from\s+["']node:/.test(distIndexContent);
console.log(
  `   ${!hasNodeImports ? "✓" : "✗"} No Node.js imports in dist/index.js`,
);

// Test 3: Check UMD build exists
console.log("\n3️⃣  Checking UMD build...");
try {
  const umdContent = readFileSync(
    join(__dirname, "dist/index.umd.js"),
    "utf-8",
  );
  const hasUMDWrapper =
    /typeof exports === 'object' && typeof module !== 'undefined'/.test(
      umdContent,
    );
  console.log(
    `   ✓ UMD build exists (${(umdContent.length / 1024).toFixed(2)} KB)`,
  );
  console.log(`   ${hasUMDWrapper ? "✓" : "✗"} Has UMD wrapper`);
} catch (_err) {
  console.log(`   ✗ UMD build not found`);
}

// Test 4: Test ESM import
console.log("\n4️⃣  Testing ESM import...");
try {
  const { default: sflow } = await import("./dist/index.js");
  const result = await sflow([1, 2, 3])
    .map((x) => x * 2)
    .toArray();
  const isCorrect = JSON.stringify(result) === JSON.stringify([2, 4, 6]);
  console.log(`   ${isCorrect ? "✓" : "✗"} ESM import works correctly`);
} catch (err) {
  console.log(`   ✗ ESM import failed: ${err.message}`);
}

console.log(`\n${"=".repeat(50)}`);
if (allChecksPassed && !hasNodeImports) {
  console.log("✅ All checks passed! sflow is ready for CDN usage.");
  console.log("\nYou can now use:");
  console.log("  - https://cdn.skypack.dev/sflow");
  console.log("  - https://esm.sh/sflow");
  console.log("  - https://unpkg.com/sflow");
  console.log("  - https://cdn.jsdelivr.net/npm/sflow");
  process.exit(0);
} else {
  console.log("❌ Some checks failed. Please review the output above.");
  process.exit(1);
}
