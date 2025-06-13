export function chunkOverlaps<T>({
  step,
  overlap,
}: {
  step: number;
  overlap: number;
}) {
  let chunks: T[] = [];
  if (step <= 0) throw new Error("step must be greater than 0");
  if (overlap < 0) throw new Error("overlap must be greater than or equal to 0");
  return new TransformStream<T, T[]>({
    transform: async (chunk, ctrl) => {
      chunks.push(chunk);
      if (chunks.length >= step + overlap) 
        ctrl.enqueue([...chunks.splice(0, step), ...chunks.slice(0, overlap)]);
      
    },
    flush: async (ctrl) => void (chunks.length && ctrl.enqueue(chunks)),
  });
}
