export function flats<T>() {
  return new TransformStream<T[], T>(
    {
      transform: (chunk, ctrl) => {
        chunk.map((e) => ctrl.enqueue(e));
      },
    },
    { highWaterMark: 1 },
    { highWaterMark: 0 } // lazy flats
  );
}
