import { Readable, Writable } from "node:stream";
import {
  fromReadable,
  fromStdioDropErr,
  fromStdioMergeError,
  fromWritable,
} from "from-node-stream";
export { fromReadable, fromWritable };

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
  } = {},
): TransformStream<string | Uint8Array, string | Uint8Array> {
  if (p.stderr instanceof Readable && stderr instanceof Writable)
    fromReadable(p.stderr).pipeTo(fromWritable(stderr), {
      preventClose: true,
    });
  if (stderr === "mergeIntoStdout") {
    return fromStdioMergeError(p);
  } else {
    return fromStdioDropErr(p);
  }
}
