export function riffles<T>(sep: T): TransformStream<T, T> {
  let last: T;
  return new TransformStream({
    transform: (chunk, ctrl) => {
      if (last !== undefined) {
        ctrl.enqueue(last);
        ctrl.enqueue(sep);
      }
      last = chunk;
    },
    flush: (ctrl) => ctrl.enqueue(last),
  });
}
