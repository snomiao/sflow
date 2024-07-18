import { heads } from "./heads";
import { aborts } from "./aborts";
import { chunks } from "./chunks";
import { chunkBys } from "./chunkBys";
import { debounces } from "./debounces";
import { filters } from "./filters";
import { flatMaps } from "./flatMaps";
import { flats } from "./flats";
import type { FlowSource } from "./FlowSource";
import { chunkIntervals } from "./chunkIntervals";
import { joins } from "./joins";
import { mapAddFields } from "./mapAddFields";
import { maps } from "./maps";
import { nils } from "./nils";
import { peeks } from "./peeks";
import { forEachs } from "./forEachs";
import { pMaps } from "./pMaps";
import { reduces } from "./reduces";
import { skips } from "./skips";
import { slices } from "./slices";
import { streamAsyncIterator } from "./streamAsyncIterator";
import { tails } from "./tails";
import { throttles } from "./throttles";
import { unwinds } from "./unwinds";
import type { FieldPathByValue } from "react-hook-form";
import type { Awaitable } from "./Awaitable";
import { uniqBys, uniqs } from "./uniqs";
import { limits } from "./limits";
import type { Unwinded } from "./Unwinded";
import { tees } from "./tees";
import { throughs } from "./throughs";
import { wseFrom, wseToArray, wseToPromise } from "./wse";
import { logs } from "./logs";
export type Reducer<S, T> = (state: S, x: T, i: number) => Awaitable<S>;
// maybe:
// subscribe (forEach+nils)
// find (filter+limit)
// distinct=uniq
//
// todo:
// catch, retry
export type snoflow<T> = ReadableStream<T> &
  AsyncIterableIterator<T> & {
    // { [Symbol.asyncDispose]: () => Promise<void> } &
    _type: T;
    readable: ReadableStream<T>;
    writable: WritableStream<T>;
    chunkBy(...args: Parameters<typeof chunkBys<T>>): snoflow<T[]>;
    /** @deprecated use chunk*/
    buffer(...args: Parameters<typeof chunks<T>>): snoflow<T[]>;
    chunk(...args: Parameters<typeof chunks<T>>): snoflow<T[]>;
    abort(...args: Parameters<typeof aborts<T>>): snoflow<T>;
    through<R>(fn: (s: snoflow<T>) => snoflow<R>): snoflow<R>; // fn must fisrt
    through<R>(stream: TransformStream<T, R>): snoflow<R>;
    through(stream?: TransformStream<T, T>): snoflow<T>;
    /** @deprecated use chunkInterval */
    interval(...args: Parameters<typeof chunkIntervals<T>>): snoflow<T[]>;
    chunkInterval(...args: Parameters<typeof chunkIntervals<T>>): snoflow<T[]>;
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
    log(...args: Parameters<typeof logs<T>>): snoflow<T>;
    peek(...args: Parameters<typeof peeks<T>>): snoflow<T>;
    forEach(...args: Parameters<typeof forEachs<T>>): snoflow<T>;
    pMap<R>(fn: (x: T, i: number) => Awaitable<R>): snoflow<R>; // fn must fisrt
    pMap<R>(concurr: number, fn: (x: T, i: number) => Awaitable<R>): snoflow<R>;
    reduce(fn: (state: T | null, x: T, i: number) => Awaitable<T>): snoflow<T>; // fn must fisrt
    reduce<S>(state: S, fn: Reducer<S, T>): snoflow<S>;
    skip: (...args: Parameters<typeof skips<T>>) => snoflow<T>;
    slice: (...args: Parameters<typeof slices<T>>) => snoflow<T>;
    tail: (...args: Parameters<typeof tails<T>>) => snoflow<T>;
    uniq: (...args: Parameters<typeof uniqs<T>>) => snoflow<T>;
    uniqBy: <K>(...args: Parameters<typeof uniqBys<T, K>>) => snoflow<T>;
    tees(fn: (s: snoflow<T>) => void | any): snoflow<T>; // fn must fisrt
    tees(stream?: WritableStream<T>): snoflow<T>;
    throttle: (...args: Parameters<typeof throttles<T>>) => snoflow<T>;
    // prevents
    preventAbort: () => snoflow<T>;
    preventClose: () => snoflow<T>;
    preventCancel: () => snoflow<T>;
    // to promises
    toNil: () => Promise<void>;
    toArray: () => Promise<T[]>;
    toCount: () => Promise<number>;
    toFirst: () => Promise<T>;
    toLast: () => Promise<T>;
    toLog(...args: Parameters<typeof logs<T>>): Promise<void>;
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
        ) => snoflow<
          Omit<T, K> & {
            [key in K]: R;
          }
        >;
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
export const snoflow = <T>(src: FlowSource<T>): snoflow<T> => {
  const r: ReadableStream<T> =
    src instanceof ReadableStream
      ? src
      : // : isXMLHTTPRequestBodyInit(src)

        // ? new Response(src).body!
        from(src);
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
    buffer: (...args: Parameters<typeof chunks>) =>
      snoflow(r.pipeThrough(chunks(...args))),
    chunk: (...args: Parameters<typeof chunks>) =>
      snoflow(r.pipeThrough(chunks(...args))),
    abort: (...args: Parameters<typeof aborts>) =>
      snoflow(r.pipeThrough(aborts(...args))),
    chunkInterval: (...args: Parameters<typeof chunkIntervals>) =>
      snoflow(r.pipeThrough(chunkIntervals(...args))),
    /** @deprecated */
    interval: (...args: Parameters<typeof chunkIntervals>) =>
      snoflow(r.pipeThrough(chunkIntervals(...args))),
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
    log: (...args: Parameters<typeof logs>) =>
      snoflow(r.pipeThrough(logs(...args))),
    uniq: (...args: Parameters<typeof uniqs>) =>
      snoflow(r.pipeThrough(uniqs(...args))),
    uniqBy: (...args: Parameters<typeof uniqBys>) =>
      snoflow(r.pipeThrough(uniqBys(...args))),
    unwind: (
      ...args: Parameters<typeof unwinds> // @ts-ignore
    ) => snoflow(r.pipeThrough(unwinds(...args))),
    pMap: (...args: Parameters<typeof pMaps>) =>
      snoflow(r.pipeThrough(pMaps(...args))),
    peek: (...args: Parameters<typeof peeks>) =>
      snoflow(r.pipeThrough(peeks(...args))),
    forEach: (...args: Parameters<typeof forEachs>) =>
      snoflow(r.pipeThrough(forEachs(...args))),
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
    /** prevent downstream abort, ignore downstream errors   */
    preventAbort: () =>
      snoflow(r.pipeThrough(throughs(), { preventAbort: true })),
    /** prevent upstream close */
    preventClose: () =>
      snoflow(r.pipeThrough(throughs(), { preventClose: true })),
    /** prevent upstream cancel, ignore upstream errors */
    preventCancel: () =>
      snoflow(r.pipeThrough(throughs(), { preventCancel: true })),
    // to promises
    toNil: () => r.pipeTo(nils<T>()),
    toArray: () => wseToArray(r),
    toCount: async () => (await wseToArray(r)).length,
    toFirst: () => wseToPromise(snoflow(r).limit(1)),
    toLast: () => wseToPromise(snoflow(r).tail(1)),
    toLog: (...args: Parameters<typeof logs<T>>) =>
      snoflow(r.pipeThrough(logs(...args))).done(),
    // as response (only ReadableStream<string | UInt8Array>)
    toResponse: (init?: ResponseInit) => new Response(r, init),
    text: (init?: ResponseInit) => new Response(r, init).text(),
    json: (init?: ResponseInit) => new Response(r, init).json(),
    blob: (init?: ResponseInit) => new Response(r, init).blob(),
    arrayBuffer: (init?: ResponseInit) => new Response(r, init).arrayBuffer(),
    // as iterator
    // [Symbol.asyncDispose]: async () => await r.pipeTo(nils()),
    [Symbol.asyncIterator]: streamAsyncIterator<T>,
  });
};
export const _tees: {
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
export const _throughs: {
  <T>(stream?: TransformStream<T, T>): TransformStream<T, T>;
  <T, R>(stream: TransformStream<T, R>): TransformStream<T, R>;
  <T, R>(fn: (s: snoflow<T>) => FlowSource<R>): TransformStream<T, R>;
} = (arg: any) => {
  if (!arg) return new TransformStream();
  if (typeof arg !== "function") return throughs((s) => s.pipeThrough(arg));
  const fn = arg;
  const { writable, readable } = new TransformStream();
  return { writable, readable: snoflow(fn(snoflow(readable))) };
};
