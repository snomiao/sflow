
type COMOPSER<T, R> = TransformStream<T, R> & {
  by: <Z>(stream: TransformStream<R, Z>) => COMOPSER<T, Z>;
};
export function composers<T, R>(stream: TransformStream<T, R>): COMOPSER<T, R> {
  return Object.assign(stream, {
    by: <Z>(appendStream: TransformStream<R, Z>) => composers({
      writable: stream.writable,
      readable: stream.readable.pipeThrough(appendStream),
    })
  });
}