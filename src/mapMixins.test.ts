import { sflow } from "./sflow";

describe("mapMixin", () => {
  it("should merge transformation result with original object", async () => {
    const result = await sflow([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ])
      .mapMixin((item) => ({ score: item.id * 10 }))
      .toArray();

    expect(result).toEqual([
      { id: 1, name: "Alice", score: 10 },
      { id: 2, name: "Bob", score: 20 },
    ]);
  });

  it("should override existing properties when merging", async () => {
    const result = await sflow([
      { id: 1, name: "Alice", status: "pending" },
      { id: 2, name: "Bob", status: "pending" },
    ])
      .mapMixin((item) => ({ status: "active", timestamp: item.id * 1000 }))
      .toArray();

    expect(result).toEqual([
      { id: 1, name: "Alice", status: "active", timestamp: 1000 },
      { id: 2, name: "Bob", status: "active", timestamp: 2000 },
    ]);
  });

  it("should work with async transformations", async () => {
    const result = await sflow([
      { id: 1, value: 5 },
      { id: 2, value: 10 },
    ])
      .mapMixin(async (item) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        return { doubled: item.value * 2 };
      })
      .toArray();

    expect(result).toEqual([
      { id: 1, value: 5, doubled: 10 },
      { id: 2, value: 10, doubled: 20 },
    ]);
  });

  it("should handle empty result objects", async () => {
    const result = await sflow([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ])
      .mapMixin(() => ({}))
      .toArray();

    expect(result).toEqual([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ]);
  });

  it("should work with index parameter", async () => {
    const result = await sflow([
      { name: "Alice" },
      { name: "Bob" },
      { name: "Charlie" },
    ])
      .mapMixin((_item, index) => ({ position: index + 1 }))
      .toArray();

    expect(result).toEqual([
      { name: "Alice", position: 1 },
      { name: "Bob", position: 2 },
      { name: "Charlie", position: 3 },
    ]);
  });

  it("should handle complex nested objects", async () => {
    const result = await sflow([
      { user: { id: 1, name: "Alice" }, data: { age: 30 } },
      { user: { id: 2, name: "Bob" }, data: { age: 25 } },
    ])
      .mapMixin((item) => ({
        computed: {
          isAdult: item.data.age >= 18,
          userLabel: `${item.user.name} (${item.user.id})`,
        },
      }))
      .toArray();

    expect(result).toEqual([
      {
        user: { id: 1, name: "Alice" },
        data: { age: 30 },
        computed: {
          isAdult: true,
          userLabel: "Alice (1)",
        },
      },
      {
        user: { id: 2, name: "Bob" },
        data: { age: 25 },
        computed: {
          isAdult: true,
          userLabel: "Bob (2)",
        },
      },
    ]);
  });

  it("should chain multiple mapMixin operations", async () => {
    const result = await sflow([
      { id: 1, value: 10 },
      { id: 2, value: 20 },
    ])
      .mapMixin((item) => ({ doubled: item.value * 2 }))
      .mapMixin((item) => ({ tripled: item.value * 3 }))
      .mapMixin((item) => ({ sum: item.doubled + item.tripled }))
      .toArray();

    expect(result).toEqual([
      { id: 1, value: 10, doubled: 20, tripled: 30, sum: 50 },
      { id: 2, value: 20, doubled: 40, tripled: 60, sum: 100 },
    ]);
  });

  it("should handle null and undefined values properly", async () => {
    const result = await sflow([
      { id: 1, value: null },
      { id: 2, value: undefined },
      { id: 3, value: 0 },
    ])
      .mapMixin((item) => ({
        hasValue: item.value !== null && item.value !== undefined,
        valueType: typeof item.value,
      }))
      .toArray();

    expect(result).toEqual([
      { id: 1, value: null, hasValue: false, valueType: "object" },
      { id: 2, value: undefined, hasValue: false, valueType: "undefined" },
      { id: 3, value: 0, hasValue: true, valueType: "number" },
    ]);
  });
});
