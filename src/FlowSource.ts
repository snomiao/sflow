import { type ReadableLike } from "web-streams-extensions";

// export type FlowSource<T> =
//   | Iterable<T>
//   | AsyncIterable<T>
//   | (() => Iterable<T>)
//   | (() => AsyncIterable<T>)
// export type FlowIterableSource<T> =
//   | (() => Iterable<T>)
//   | (() => AsyncIterable<T>)

export type FlowSource<T> =
  | Promise<T>
  | Iterable<T>
  | AsyncIterable<T>
  | (() => Iterable<T>)
  | (() => AsyncIterable<T>)
  | ReadableLike<T>
  | ReadableStream<T>;
// | ((w: WritableStream<T>) => void)
// | sflow<T>;
// | (T extends Uint8Array ? XMLHttpRequestBodyInit : never);
// export interface FlowSource<T> extends Promise<T>
//   , Iterable<T>
//   , AsyncIterable<T>
//   , ArrayLike<T>
//   , FlowIterableGeneratorSource<T>
//   , ReadableLike<T>
//   // , Omit<ReadableStream<T>, Symbol.asyncIterator>
// // | (T extends Uint8Array ? XMLHttpRequestBodyInit : never);
// { }
// export interface IterableFlowSource<T> extends Iterable<T>,
// AsyncIterable<T> {
// }
// export interface FlowIterableGeneratorSource<T> {
// (): Iterable<T>,
// (): AsyncIterable<T>,
// }
