import type { FieldPathByValue } from "react-hook-form";
import {
  from as wseFrom,
  merge as wseMerge,
  toArray as wseToArray,
  toPromise as wseToPromise,
} from "web-streams-extensions";
import type { Awaitable } from "./Awaitable";
import type { Unwinded } from "./Unwinded";
import { aborts } from "./aborts";
import { buffers } from "./buffers";
import { chunkBys } from "./chunkBys";
import { debounces } from "./debounces";
import { filters } from "./filters";
import { flatMaps } from "./flatMaps";
import { flats } from "./flats";
import type { flowSource } from "./flowSource";
import { intervals } from "./intervals";
import { joins } from "./joins";
import { mapAddFields } from "./mapAddFields";
import { maps } from "./maps";
import { nils } from "./nils";
import { pMaps } from "./pMaps";
import { peeks } from "./peeks";
import { reduces } from "./reduces";
import { skips } from "./skips";
import { slices } from "./slices";
import { streamAsyncIterator } from "./streamAsyncIterator";
import { tails } from "./tails";
import { tees } from "./tees";
import { throttles } from "./throttles";
import { throughs } from "./throughs";
import { unwinds } from "./unwinds";
export type { Unwinded } from "./Unwinded";
export { aborts } from "./aborts";
export { buffers } from "./buffers";
export { debounces } from "./debounces";
export { filters } from "./filters";
export { flatMaps } from "./flatMaps";
export { flats } from "./flats";
export type { flowSource } from "./flowSource";
export { intervals } from "./intervals";
export { joins } from "./joins";
export { mapAddFields } from "./mapAddFields";
export { maps } from "./maps";
export { mergeAscends, mergeDescends } from "./mergeAscends";
export { nils } from "./nils";
export { pMaps } from "./pMaps";
export { peeks } from "./peeks";
export { reduces } from "./reduces";
export { skips } from "./skips";
export { slices } from "./slices";
export { streamAsyncIterator } from "./streamAsyncIterator";
export { tails } from "./tails";
export { tees } from "./tees";
export { throttles } from "./throttles";
export { throughs } from "./throughs";
export { unwinds } from "./unwinds";

/** @deprecated will remove next major version */
export const merges: (
  concurrent?: number
) => <T>(
  src: ReadableStream<ReadableStream<T> | Promise<T>>
) => ReadableStream<T> = wseMerge as any;

const _throughs: {
  <T>(stream?: TransformStream<T, T>): TransformStream<T, T>;
  <T, R>(stream: TransformStream<T, R>): TransformStream<T, R>;
  <T, R>(fn: (s: snoflow<T>) => flowSource<R>): TransformStream<T, R>;
} = (arg: any) => {
  if (!arg) return new TransformStream();
  if (typeof arg !== "function") return throughs((s) => s.pipeThrough(arg));
  const fn = arg;
  const { writable, readable } = new TransformStream();
  return { writable, readable: snoflow(fn(snoflow(readable))) };
};

export const firsts = limits;
export function heads<T>(n = 1) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      return void (n-- > 0 && ctrl.enqueue(chunk));
    },
  });
}
/** Currently will not pipe down more items after count satisfied, but still receives more items. */
export function limits<T>(n: number, { terminate = false } = {}) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      if (n-- > 0) {
        ctrl.enqueue(chunk);
      } else {
        terminate && ctrl.terminate();
      }
    },
  });
}

export const wseMerges: (
  concurrent?: number
) => <T>(
  src: ReadableStream<ReadableStream<T> | Promise<T>>
) => ReadableStream<T> = wseMerge as any;

export const parallels = <SRCS extends ReadableStream<any>[]>(...srcs: SRCS) =>
  wseMerges()(wseFrom(srcs)) as ReadableStream<
    {
      [key in keyof SRCS]: SRCS[key] extends ReadableStream<infer T>
        ? T
        : never;
    }[number]
  >;
type Reducer<S, T> = (state: S, x: T, i: number) => Awaitable<S>;
export type snoflow<T> = ReadableStream<T> &
  AsyncIterableIterator<T> & {
    _type: T;
    readable: ReadableStream<T>;
    writable: WritableStream<T>;
    chunkBy(...args: Parameters<typeof chunkBys<T>>): snoflow<T[]>;
    buffer(...args: Parameters<typeof buffers<T>>): snoflow<T[]>;
    abort(...args: Parameters<typeof aborts<T>>): snoflow<T>;
    through<R>(fn: (s: snoflow<T>) => snoflow<R>): snoflow<R>; // fn must fisrt
    through<R>(stream: TransformStream<T, R>): snoflow<R>;
    through(stream?: TransformStream<T, T>): snoflow<T>;
    interval(...args: Parameters<typeof intervals<T>>): snoflow<T[]>;
    debounce(...args: Parameters<typeof debounces<T>>): snoflow<T>;
    done: (pipeTo?: WritableStream<T>) => Promise<void>;
    end: (pipeTo?: WritableStream<T>) => Promise<void>;
    filter(fn: (x: T, i: number) => Awaitable<any>): snoflow<T>; // fn must fisrt
    filter(): snoflow<NonNullable<T>>;
    flatMap<R>(...args: Parameters<typeof flatMaps<T, R>>): snoflow<R>;
    join(fn: (s: WritableStream<T>) => void | any): snoflow<T>;
    join(stream?: ReadableStream<T>): snoflow<T>;
    limit(...args: Parameters<typeof limits<T>>): snoflow<T>;
    head(...args: Parameters<typeof heads<T>>): snoflow<T>;
    map<R>(...args: Parameters<typeof maps<T, R>>): snoflow<R>;
    peek(...args: Parameters<typeof peeks<T>>): snoflow<T>;
    pMap<R>(fn: (x: T, i: number) => Awaitable<R>): snoflow<R>; // fn must fisrt
    pMap<R>(concurr: number, fn: (x: T, i: number) => Awaitable<R>): snoflow<R>;
    reduce(fn: (state: T | null, x: T, i: number) => Awaitable<T>): snoflow<T>; // fn must fisrt
    reduce<S>(state: S, fn: Reducer<S, T>): snoflow<S>;
    skip: (...args: Parameters<typeof skips<T>>) => snoflow<T>;
    slice: (...args: Parameters<typeof slices<T>>) => snoflow<T>;
    tail: (...args: Parameters<typeof tails<T>>) => snoflow<T>;
    tees(fn: (s: snoflow<T>) => void | any): snoflow<T>; // fn must fisrt
    tees(stream?: WritableStream<T>): snoflow<T>;
    throttle: (...args: Parameters<typeof throttles<T>>) => snoflow<T>;
    // to promises
    toArray: () => Promise<T[]>;
    toCount: () => Promise<number>;
    toFirst: () => Promise<T>;
    toLast: () => Promise<T>;
  } & (T extends ReadonlyArray<any>
    ? {
        flat: (...args: Parameters<typeof flats<T>>) => snoflow<T[number]>;
      }
    : {}) &
  (T extends Record<string, any>
    ? {
        unwind<K extends FieldPathByValue<T, ReadonlyArray<any>>>(
          key: K
        ): snoflow<Unwinded<T, K>>;
        mapAddField: <K extends string, R>(
          ...args: Parameters<typeof mapAddFields<K, T, R>>
        ) => snoflow<Omit<T, K> & { [key in K]: R }>;
      }
    : {}) &
  (T extends string | Uint8Array
    ? {
        // to response
        toResponse: () => Response;
        text: () => Promise<string>;
        json: () => Promise<any>;
        blob: () => Promise<Blob>;
        arrayBuffer: () => Promise<ArrayBuffer>;
      }
    : {});
// | (T extends Uint8Array ? XMLHttpRequestBodyInit : never);

export const snoflow = <T>(src: flowSource<T>): snoflow<T> => {
  const r: ReadableStream<T> =
    src instanceof ReadableStream
      ? src
      : // : isXMLHTTPRequestBodyInit(src)
        // ? new Response(src).body!
        wseFrom(src);
  // @ts-ignore todo
  return Object.assign(r, {
    _type: null as T,
    get readable() {
      return r;
    },
    // get writable() {
    //   DIE(new Error("WIP"));
    //   return new WritableStream();
    // },
    through: (...args: Parameters<typeof _throughs>) =>
      snoflow(r.pipeThrough(_throughs(...args))),
    mapAddField: (
      ...args: Parameters<typeof mapAddFields> // @ts-ignore
    ) => snoflow(r.pipeThrough(mapAddFields(...args))),
    chunkBy: (...args: Parameters<typeof chunkBys>) =>
      snoflow(r.pipeThrough(chunkBys(...args))),
    buffer: (...args: Parameters<typeof buffers>) =>
      snoflow(r.pipeThrough(buffers(...args))),
    abort: (...args: Parameters<typeof aborts>) =>
      snoflow(r.pipeThrough(aborts(...args))),
    interval: (...args: Parameters<typeof intervals>) =>
      snoflow(r.pipeThrough(intervals(...args))),
    debounce: (...args: Parameters<typeof debounces>) =>
      snoflow(r.pipeThrough(debounces(...args))),
    done: (dst = nils<T>()) => r.pipeTo(dst),
    end: (dst = nils<T>()) => r.pipeTo(dst),
    filter: (...args: Parameters<typeof filters>) =>
      snoflow(r.pipeThrough(filters(...args))),
    flatMap: (...args: Parameters<typeof flatMaps>) =>
      snoflow(r.pipeThrough(flatMaps(...args))),
    flat: (
      ...args: Parameters<typeof flats> // @ts-ignore
    ) => snoflow(r.pipeThrough(flats(...args))),
    join: (...args: Parameters<typeof joins>) =>
      snoflow(r.pipeThrough(joins(...args))),
    limit: (...args: Parameters<typeof limits>) =>
      snoflow(r.pipeThrough(limits(...args))),
    head: (...args: Parameters<typeof heads>) =>
      snoflow(r.pipeThrough(heads(...args))),
    map: (...args: Parameters<typeof maps>) =>
      snoflow(r.pipeThrough(maps(...args))),
    unwind: (
      ...args: Parameters<typeof unwinds> // @ts-ignore
    ) => snoflow(r.pipeThrough(unwinds(...args))),
    pMap: (...args: Parameters<typeof pMaps>) =>
      snoflow(r.pipeThrough(pMaps(...args))),
    peek: (...args: Parameters<typeof peeks>) =>
      snoflow(r.pipeThrough(peeks(...args))),
    reduce: (...args: Parameters<typeof reduces>) =>
      snoflow(r.pipeThrough(reduces(...args))),
    skip: (...args: Parameters<typeof skips>) =>
      snoflow(r.pipeThrough(skips(...args))),
    slice: (...args: Parameters<typeof slices>) =>
      snoflow(r.pipeThrough(slices(...args))),
    tail: (...args: Parameters<typeof tails>) =>
      snoflow(r.pipeThrough(tails(...args))),
    tees: (...args: Parameters<typeof _tees>) =>
      snoflow(r.pipeThrough(_tees(...args))),
    throttle: (...args: Parameters<typeof throttles>) =>
      snoflow(r.pipeThrough(throttles(...args))),
    // to promises
    toArray: () => wseToArray(r),
    toCount: async () => (await wseToArray(r)).length,
    toFirst: () => wseToPromise(snoflow(r).limit(1)),
    toLast: () => wseToPromise(snoflow(r).tail(1)),
    // as response (only ReadableStream<string | UInt8Array>)
    toResponse: (init?: ResponseInit) => new Response(r, init),
    text: (init?: ResponseInit) => new Response(r, init).text(),
    json: (init?: ResponseInit) => new Response(r, init).json(),
    blob: (init?: ResponseInit) => new Response(r, init).blob(),
    arrayBuffer: (init?: ResponseInit) => new Response(r, init).arrayBuffer(),
    // as iterator
    [Symbol.asyncIterator]: streamAsyncIterator<T>,
  });
};

const _tees: {
  <T>(fn: (s: snoflow<T>) => void | any): TransformStream<T, T>;
  <T>(stream?: WritableStream<T>): TransformStream<T, T>;
} = (arg) => {
  if (!arg) return new TransformStream();
  if (arg instanceof WritableStream) return tees((s) => s.pipeTo(arg));
  const fn = arg;
  const { writable, readable } = new TransformStream();
  const [a, b] = readable.tee();
  // @ts-ignore
  fn(snoflow(a));
  return { writable, readable: b };
};
const isXMLHTTPRequestBodyInit = (v: any): v is XMLHttpRequestBodyInit =>
  v instanceof Blob ||
  v instanceof ArrayBuffer ||
  v instanceof FormData ||
  v instanceof URLSearchParams ||
  typeof v === "string";
