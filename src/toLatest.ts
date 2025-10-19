/**
 * Convert a readable stream to it's latest value
 *
 * the return object is dynamic updated
 */
export function toLatests<T>(r: ReadableStream<T>): {
  latest: Promise<T>;
  next: Promise<T>;
} {
  let latest: T | undefined;
  let nextPromise = Promise.withResolvers<T>();
  r.pipeTo(
    new WritableStream<T>({
      write: (value) => {
        latest = value;
        nextPromise.resolve(value);
        nextPromise = Promise.withResolvers<T>();
      },
      close: () => {
        nextPromise.resolve(undefined);
      },
    }),
  );
  return {
    get latest() {
      if (latest === undefined) {
        return nextPromise.promise;
      }
      return Promise.resolve(latest);
    },
    get next() {
      return nextPromise.promise;
    },
  };
}
