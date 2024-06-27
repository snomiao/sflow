/** Note: will abort immediately without a signal provided */
export function aborts<T>(signal?: AbortSignal) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => signal?.aborted || !signal ? ctrl.terminate() : ctrl.enqueue(chunk),
  });
}
