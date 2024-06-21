import { from, toArray, toPromise, toString } from "web-streams-extensions";

export function maps<T, R>(fn: (x: T) => Promise<R> | R) {
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => {
      ctrl.enqueue(await fn(chunk));
    },
  });
}
export function nils<T>() {
  return new WritableStream<T>();
}
export function filters<T>(fn: (x: T) => Promise<boolean> | boolean) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      if (await fn(chunk)) ctrl.enqueue(chunk);
    },
  });
}
export function flatmaps<T, R>(fn: (x: T) => Promise<R[]> | R[]) {
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => {
      (await fn(chunk)).map((e) => ctrl.enqueue(e));
    },
  });
}
export function flats<T>() {
  return new TransformStream<T[], T>({
    transform: async (chunk, ctrl) => {
      chunk.map((e) => ctrl.enqueue(e));
    },
  });
}
export function reduces<T, S>(
  state: S,
  fn: (state: S, x: T) => Promise<S> | S
) {
  return new TransformStream<T, S>({
    transform: async (chunk, ctrl) =>
      ctrl.enqueue((state = await fn(state, chunk))),
  });
}
export function lasts<T>() {
  let item: T;
  return new TransformStream<T>({
    transform: async (chunk, ctrl) => {
      item = chunk;
    },
    flush: (ctrl) => {
      ctrl.enqueue(item);
    },
  });
}
export function firsts<T>() {
  let item: T;
  return new TransformStream<T>({
    transform: async (chunk, ctrl) => {
      ctrl.enqueue(item);
      ctrl.terminate();
    },
  });
}
/** you could use flats to re-join buffers */
export function buffers<T>(n: number) {
  let chunks: T[] = [];
  if (n <= 0) throw new Error("Buffer size must be greater than 0");
  return new TransformStream<T>({
    transform: async (chunk, ctrl) => {
      chunks.push(chunk);
      if (chunks.length === n) {
        ctrl.enqueue(chunks);
        chunks = [];
      }
    },
  });
}

export { from, toArray, toPromise, toString };
