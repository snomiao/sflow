import type { Awaitable } from "./Awaitable";

export type ChunkTransformer<T> = (
  chunks: T[],
  ctrl: TransformStreamDefaultController<T>
) => Awaitable<T[]>;

/**
 * Creates a TransformStream that processes chunks using provided transformers.
 *
 * @template T - The type of chunk that the TransformStream will process.
 *
 * @param {Object} options - The options object containing transformer functions.
 * @param {ChunkTransformer<T>} [options.start] - The transformer function to run when the stream is started.
 * @param {ChunkTransformer<T>} [options.transform] - The transformer function to run for each chunk, current chunk will be the last element.
 * @param {ChunkTransformer<T>} [options.flush] - The transformer function to run when the stream is flushed.
 *
 * @returns A new TransformStream that applies the provided transformers.
 */
export function chunkTransforms<T>(options: {
  start?: ChunkTransformer<T>;
  transform?: ChunkTransformer<T>;
  flush?: ChunkTransformer<T>;
}) {
  let chunks: T[] = [];
  const { start, transform, flush } = options;
  return new TransformStream<T, T>({
    start: async (ctrl) => {
      if (start) chunks = await start(chunks, ctrl);
    },
    transform: async (chunk, ctrl) => {
      chunks.push(chunk);
      if (transform) chunks = await transform(chunks, ctrl);
    },
    flush: async (ctrl) => {
      if (flush) chunks = await flush(chunks, ctrl);
    },
  });
}
