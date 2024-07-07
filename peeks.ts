/** Note: peeks will not await peek fn, use forEachs if you want promise tobe awaited  */
export function peeks<T>(fn: (x: T, i: number) => void) {
  let i = 0;
  return new TransformStream<T, T>({
    transform: (chunk, ctrl) => {
      fn(chunk, i++);
      ctrl.enqueue(chunk);
    },
  });
}
