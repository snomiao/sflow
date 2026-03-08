import { retry } from "./retry";
import { sflow } from "./sflow";

describe("retry", () => {
  it("returns result on first success", async () => {
    const fn = retry((_e, _a, fn, x) => fn(x), async (x: number) => x * 2);
    expect(await fn(5)).toBe(10);
  });

  it("retries on transient errors", async () => {
    let calls = 0;
    const fn = retry(
      (_error, attempt, fn) => {
        if (attempt > 5) throw _error;
        return fn();
      },
      async () => {
        calls++;
        if (calls < 3) throw new Error("transient");
        return "ok";
      },
    );
    expect(await fn()).toBe("ok");
    expect(calls).toBe(3);
  });

  it("stops retrying when handler throws", async () => {
    let calls = 0;
    const fn = retry(
      (error) => { throw error; },
      async () => {
        calls++;
        throw new Error("permanent");
      },
    );
    await expect(fn()).rejects.toThrow("permanent");
    expect(calls).toBe(1);
  });

  it("passes attempt count correctly (1-based)", async () => {
    const attempts: number[] = [];
    let calls = 0;
    const fn = retry(
      (_error, attempt, fn) => {
        attempts.push(attempt);
        if (attempt >= 3) throw new Error("give up");
        return fn();
      },
      async () => {
        calls++;
        throw new Error("fail");
      },
    );
    await expect(fn()).rejects.toThrow("give up");
    expect(attempts).toEqual([1, 2, 3]);
    expect(calls).toBe(3);
  });

  it("passes original args to error handler", async () => {
    const receivedArgs: [string, number][] = [];
    let calls = 0;
    const fn = retry(
      (_error, _attempt, fn, a, b) => {
        receivedArgs.push([a, b]);
        if (calls >= 2) throw new Error("stop");
        return fn(a, b);
      },
      async (a: string, b: number) => {
        calls++;
        throw new Error("fail");
      },
    );
    await expect(fn("hello", 42)).rejects.toThrow("stop");
    expect(receivedArgs[0]).toEqual(["hello", 42]);
  });

  it("works with sync functions", async () => {
    let calls = 0;
    const fn = retry(
      (_error, attempt, fn, x) => {
        if (attempt > 5) throw _error;
        return fn(x);
      },
      (x: number) => {
        calls++;
        if (calls < 2) throw new Error("transient");
        return x + 1;
      },
    );
    expect(await fn(10)).toBe(11);
    expect(calls).toBe(2);
  });

  it("retries with different args", async () => {
    const fn = retry(
      (error, attempt, fn, x) => {
        if (attempt > 5) throw error;
        return fn(x + 1);
      },
      async (x: number) => {
        if (x < 5) throw new Error("too small");
        return x;
      },
    );
    expect(await fn(3)).toBe(5);
  });

  it("works inside sflow().map()", async () => {
    const callCounts = new Map<number, number>();
    const fn = retry(
      (error, attempt, fn, x) => {
        if (attempt > 2) throw error;
        return fn(x);
      },
      async (x: number) => {
        const count = (callCounts.get(x) ?? 0) + 1;
        callCounts.set(x, count);
        if (x === 2 && count < 2) throw new Error("transient");
        return x * 10;
      },
    );

    const result = await sflow([1, 2, 3]).map(fn).toArray();
    expect(result).toEqual([10, 20, 30]);
  });
});
