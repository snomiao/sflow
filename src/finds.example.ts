import { sflow } from "./sflow";

// Example 1: Find first even number
async function example1() {
  console.log("Example 1: Find first even number");
  const result = await sflow([1, 3, 5, 6, 7, 8])
    .find((x) => x % 2 === 0)
    .toArray();
  console.log("Result:", result); // [6]
}

// Example 2: Find first string starting with 'b'
async function example2() {
  console.log("Example 2: Find first string starting with 'b'");
  const result = await sflow(["apple", "banana", "cherry", "berry"])
    .find((fruit) => fruit.startsWith("b"))
    .toArray();
  console.log("Result:", result); // ['banana']
}

// Example 3: Using toFirstMatch for convenience
async function example3() {
  console.log("Example 3: Using toFirstMatch");
  const result = await sflow([10, 15, 20, 25, 30]).toFirstMatch((x) => x > 20);
  console.log("Result:", result); // 25
}

// Example 4: Find with async predicate
async function example4() {
  console.log("Example 4: Find with async predicate");
  const users = [
    { id: 1, name: "Alice", age: 25 },
    { id: 2, name: "Bob", age: 30 },
    { id: 3, name: "Charlie", age: 35 },
  ];

  const result = await sflow(users)
    .find(async (user) => {
      // Simulate async check (e.g., database lookup)
      await new Promise((resolve) => setTimeout(resolve, 10));
      return user.age >= 30;
    })
    .toArray();
  console.log("Result:", result); // [{ id: 2, name: 'Bob', age: 30 }]
}

// Example 5: No match found
async function example5() {
  console.log("Example 5: No match found");
  const result = await sflow([1, 3, 5, 7])
    .find((x) => x % 2 === 0)
    .toArray();
  console.log("Result:", result); // []

  const resultFirstMatch = await sflow([1, 3, 5, 7]).toFirstMatch(
    (x) => x % 2 === 0,
  );
  console.log("toFirstMatch result:", resultFirstMatch); // undefined
}

// Run all examples
async function runExamples() {
  await example1();
  await example2();
  await example3();
  await example4();
  await example5();
}

if (require.main === module) {
  runExamples();
}
