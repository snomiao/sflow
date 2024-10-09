import DIE from "phpdie";
import { Readable, Writable } from "stream";
import { sf } from ".";


/** Make TransformStream from stdio 
 *  @deprecated import {fromStdio} from 'from-node-stream'
 */
export function fromStdio(
  /** a process, which has stdin, stdout, stderr */
  p: {
    stdin?: Writable | null;
    stdout?: Readable | null;
    stderr?: Readable | null;
  },
  {
    stderr = process.stderr,
  }: {
    // input stderr will pipe to this stream, defaults to process.stderr if undefined
    stderr?: Writable | "mergeIntoStdout";
  } = {}
): TransformStream<string | Uint8Array, string | Uint8Array> {
  if (p.stderr instanceof Readable && stderr instanceof Writable)
    fromReadable(p.stderr).pipeTo(fromWritable(stderr), {
      preventClose: true,
    });
  return {
    writable: fromWritable(p.stdin || DIE("Missing stdin")),
    readable: sf(
      fromReadable(p.stdout || DIE("Missing stdout")),
      ...(stderr === "mergeIntoStdout"
        ? [fromReadable(p.stderr || DIE("Missing stderr"))]
        : [])
    ),
  };
}

/** 
 *  @deprecated import from 'from-node-stream'
 */
export function fromReadable<T extends string | Uint8Array>(
  i: Readable | NodeJS.ReadableStream
): ReadableStream<T> {
  return new ReadableStream({
    start: (c) => {
      i.on("data", (data) => c.enqueue(data));
      i.on("close", () => c.close());
      i.on("error", (err) => c.error(err));
    },
    cancel: (reason) => (
      (i as Partial<Readable> & Partial<NodeJS.ReadableStream>).destroy?.(
        reason
      ),
      undefined
    ),
  });
}

/** 
 *  @deprecated import from 'from-node-stream'
 */
export function fromWritable<T extends string | Uint8Array>(
  i: Writable | NodeJS.WritableStream
): WritableStream<T> {
  return new WritableStream({
    start: (c) => (i.on("error", (err) => c.error(err)), undefined),
    abort: (reason) => (
      (i as Partial<Writable> & Partial<NodeJS.WritableStream>).destroy?.(
        reason
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
