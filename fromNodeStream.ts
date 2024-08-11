import { Readable, Writable } from "node:stream";

export function fromReadable<T extends string | Uint8Array>(
  i: Readable | NodeJS.ReadableStream,
): ReadableStream<T> {
  return new ReadableStream({
    start: (c) => {
      i.on("data", (data) => c.enqueue(data));
      i.on("close", () => c.close());
      i.on("error", (err) => c.error(err));
    },
    cancel: (reason) => (
      (i as Partial<Readable> & Partial<NodeJS.ReadableStream>).destroy?.(
        reason,
      ),
      undefined
    ),
  });
}

export function fromWritable<T extends string | Uint8Array>(
  i: Writable | NodeJS.WritableStream,
): WritableStream<T> {
  return new WritableStream({
    start: (c) => (i.on("error", (err) => c.error(err)), undefined),
    abort: (reason) => (
      (i as Partial<Writable> & Partial<NodeJS.WritableStream>).destroy?.(
        reason,
      ),
      undefined
    ),
    write: (data: string | Uint8Array, c) => (i.write(data), undefined),
    close: () => (i.end(), undefined),
  });
}

// export function toReadable<T>(i: ReadableStream<T>): Readable {
//     const i = new Readable()
//     i.pipeTo(Readable)
//   return new Readable({
//     start: (c) => {
//     },
//     cancel: (reason) => (i.destroy(reason), undefined),
//   });
// }

// export function toWritable(i: Writable) {
//   return new WritableStream({
//     start: (c) => (i.on("error", (err) => c.error(err)), undefined),
//     abort: (reason) => (i.destroy(reason), undefined),
//     write: (data, c) => (i.write(data), undefined),
//     close: () => (i.end(), undefined),
//   });
// }
