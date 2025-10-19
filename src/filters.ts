import type { Awaitable } from "./Awaitable";

/**
 * Filter a stream, return a stream with non-null values.
 * If a function is provided, it will be called with each value,
 * and if it returns a truthy value, the value will be included in the output
 * stream.
 * If no function is provided, it will filter out null and undefined values.
 * This is useful for creating a stream that only contains non-null and non-undefined values.
 *
 * Note: empty string is considered a valid value and will not be filtered out.
 *
 * if you want to filter out empty strings, you can "Boolean" the filter function.
 *
 * @param fn Optional function to determine if a value should be included.
 * @returns A TransformStream that filters the input stream.
 * @template T The type of the input stream.
 * @template NonNullable<T> The type of the output stream, which will not include
 * null or undefined values.
 * @example
 */
export const filters: {
  <T>(): TransformStream<T, NonNullable<T>>;
  <T>(fn: (x: T, i: number) => Awaitable<any>): TransformStream<T, T>;
} = (fn?: (...args: any[]) => any) => {
  let i = 0;
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      if (fn) {
        const shouldEnqueue = await fn(chunk, i++);
        if (shouldEnqueue) ctrl.enqueue(chunk);
      } else {
        const isNull = undefined === chunk || null === chunk;
        if (!isNull) ctrl.enqueue(chunk);
      }
    },
  });
};
