import { DIEError } from "phpdie";
import type { FieldPathByValue } from "react-hook-form";
import type { Split } from "ts-toolbelt/out/String/Split";
import type { Awaitable } from "./Awaitable";
import { chunkBys } from "./chunkBys";
import { chunkIfs } from "./chunkIfs";
import { chunkIntervals } from "./chunkIntervals";
import { chunks } from "./chunks";
import { confluences } from "./confluences";
import { convolves } from "./convolves";
import { debounces } from "./debounces";
import { filters } from "./filters";
import { flatMaps } from "./flatMaps";
import { flats } from "./flats";
import type { FlowSource } from "./FlowSource";
import { forEachs } from "./forEachs";
import { toStream } from "./froms";
import { heads } from "./heads";
import { limits } from "./limits";
import { lines } from "./lines";
import { logs } from "./logs";
import { mapAddFields } from "./mapAddFields";
import { maps } from "./maps";
import { merges } from "./merges";
import { nils } from "./nils";
import { peeks } from "./peeks";
import { asyncMaps, pMaps } from "./pMaps";
import { reduceEmits } from "./reduceEmits";
import { reduces } from "./reduces";
import { riffles } from "./riffles";
import { skips } from "./skips";
import { slices } from "./slices";
import { streamAsyncIterator } from "./streamAsyncIterator";
import { matchAlls, matchs, replaceAlls, replaces } from "./strings";
import { tails } from "./tails";
import { tees } from "./tees";
import { terminates } from "./terminates";
import { throttles } from "./throttles";
import { throughs } from "./throughs";
import { uniqBys, uniqs } from "./uniqs";
import type { Unwinded } from "./Unwinded";
import { unwinds } from "./unwinds";
import { wseToArray, wseToPromise } from "./wse";
import { csvFormats, csvParses, tsvFormats, tsvParses } from "./xsvStreams";
export type Reducer<S, T> = (state: S, x: T, i: number) => Awaitable<S>;
export type EmitReducer<S, T, R> = (
  state: S,
  x: T,
  i: number
) => Awaitable<{ next: S; emit: R }>;
interface BaseFlow<T> {
  _type: T;
  readable: ReadableStream<T>;
  writable: WritableStream<T>;

  /** @deprecated use chunk*/
  buffer(...args: Parameters<typeof chunks<T>>): sflow<T[]>;

  /** inverse of flat */
  chunk(...args: Parameters<typeof chunks<T>>): sflow<T[]>;
  chunkBy(...args: Parameters<typeof chunkBys<T>>): sflow<T[]>;
  chunkIf(...args: Parameters<typeof chunkIfs<T>>): sflow<T[]>;

  convolve(...args: Parameters<typeof convolves<T>>): sflow<T[]>;

  abort(...args: Parameters<typeof terminates<T>>): sflow<T>;

  through(): sflow<T>;
  through(stream: TransformStream<T, T>): sflow<T>;
  through<R>(fn: (s: sflow<T>) => FlowSource<R>): sflow<R>; // fn must fisrt
  through<R>(stream: TransformStream<T, R>): sflow<R>;

  /** @deprecated use chunkInterval */
  interval(...args: Parameters<typeof chunkIntervals<T>>): sflow<T[]>;
  chunkInterval(...args: Parameters<typeof chunkIntervals<T>>): sflow<T[]>;
  debounce(...args: Parameters<typeof debounces<T>>): sflow<T>;
  done: (pipeTo?: WritableStream<T>) => Promise<void>;
  end: (pipeTo?: WritableStream<T>) => Promise<void>;
  filter(fn: (x: T, i: number) => Awaitable<any>): sflow<T>; // fn must fisrt
  filter(): sflow<NonNullable<T>>;

  flatMap<R>(...args: Parameters<typeof flatMaps<T, R>>): sflow<R>;

  /** @deprecated to join another stream, use merge instead  */
  join(fn: (s: WritableStream<T>) => void | any): sflow<T>;
  /** @deprecated to join another stream, use merge instead  */
  join(stream?: ReadableStream<T>): sflow<T>;
  merge(fn: (s: WritableStream<T>) => void | any): sflow<T>;
  merge(stream?: ReadableStream<T>): sflow<T>;
  limit(...args: Parameters<typeof limits<T>>): sflow<T>;
  head(...args: Parameters<typeof heads<T>>): sflow<T>;
  map<R>(...args: Parameters<typeof maps<T, R>>): sflow<R>;
  log(...args: Parameters<typeof logs<T>>): sflow<T>;
  peek(...args: Parameters<typeof peeks<T>>): sflow<T>;
  riffle(...args: Parameters<typeof riffles<T>>): sflow<T>;
  forEach(...args: Parameters<typeof forEachs<T>>): sflow<T>;
  pMap<R>(fn: (x: T, i: number) => Awaitable<R>): sflow<R>;
  pMap<R>(
    fn: (x: T, i: number) => Awaitable<R>,
    options?: {
      concurrency?: number;
    }
  ): sflow<R>;
  asyncMap<R>(fn: (x: T, i: number) => Awaitable<R>): sflow<R>;
  asyncMap<R>(
    fn: (x: T, i: number) => Awaitable<R>,
    options?: {
      concurrency?: number;
    }
  ): sflow<R>;
  reduce(fn: (state: T | undefined, x: T, i: number) => Awaitable<T>): sflow<T>; // fn must fisrt
  reduce(fn: Reducer<T, T>, initialState: T): sflow<T>;
  reduce<S>(
    fn: (state: S | undefined, x: T, i: number) => Awaitable<S>
  ): sflow<S>; // fn must fisrt
  reduce<S>(fn: Reducer<S, T>, initialState: S): sflow<S>;
  reduceEmit(fn: EmitReducer<T, T, T>): sflow<T>;
  reduceEmit<R>(fn: EmitReducer<T, T, R>): sflow<R>;
  reduceEmit<S, R>(fn: EmitReducer<S, T, R>, state: S): sflow<R>;
  skip: (...args: Parameters<typeof skips<T>>) => sflow<T>;
  slice: (...args: Parameters<typeof slices<T>>) => sflow<T>;
  tail: (...args: Parameters<typeof tails<T>>) => sflow<T>;
  uniq: (...args: Parameters<typeof uniqs<T>>) => sflow<T>;
  uniqBy: <K>(...args: Parameters<typeof uniqBys<T, K>>) => sflow<T>;
  tees(fn: (s: sflow<T>) => void | any): sflow<T>; // fn must fisrt
  tees(stream?: WritableStream<T>): sflow<T>;
  throttle: (...args: Parameters<typeof throttles<T>>) => sflow<T>;
  // prevents
  preventAbort: () => sflow<T>;
  preventClose: () => sflow<T>;
  preventCancel: () => sflow<T>;
  // to promises
  toEnd: () => Promise<void>;
  toNil: () => Promise<void>;
  toArray: () => Promise<T[]>;

  /** Count stream items, and drop items */
  toCount: () => Promise<number>;

  /** Get first item from stream, and terminate stream */
  toFirst: () => Promise<T>;

  /** Get one item from stream
   * throws if more than 1 item is emitted
   * return undefined if no item returned
   * return the item
   */
  toOne: (options?: { required?: boolean }) => Promise<T | undefined>;
  /** Get one item from stream
   * throws if more than 1 item is emitted
   * throws if no items emitted, (required defaults to false)
   * return the item
   */
  toAtLeastOne: (options?: { required?: boolean }) => Promise<T>;
  /** Returns a promise that always give you latest value of the stream */
  // toLatest: () => Promise<{ value: T; readable: sflow<T> }>;

  /** Get last item from stream, ignore others */
  toLast: () => Promise<T>;
  toLog(...args: Parameters<typeof logs<T>>): Promise<void>;
}

type ArrayFlow<T> = T extends ReadonlyArray<any>
  ? {
      // inverse of chunk
      flat: (...args: Parameters<typeof flats<T>>) => sflow<T[number]>;
    }
  : {};

type DictionaryFlow<T> = T extends Record<string, any>
  ? {
      unwind<K extends FieldPathByValue<T, ReadonlyArray<any>>>(
        key: K
      ): sflow<Unwinded<T, K>>;
      mapAddField: <K extends string, R>(
        ...args: Parameters<typeof mapAddFields<K, T, R>>
      ) => sflow<
        Omit<T, K> & {
          [key in K]: R;
        }
      >;
    }
  : {};

type StreamsFlow<T> = T extends ReadableStream<infer T>
  ? {
      confluence(...args: Parameters<typeof confluences<T>>): sflow<T>;
    }
  : {};

type TextFlow<T> = T extends string
  ? {
      join: (sep: string) => sflow<string>;
      lines: (
        ...args: Parameters<typeof lines>
      ) => sflow<
        ReturnType<typeof lines> extends TransformStream<any, infer R>
          ? R
          : never
      >;
      match: (
        ...args: Parameters<typeof matchs>
      ) => sflow<
        ReturnType<typeof matchs> extends TransformStream<any, infer R>
          ? R
          : never
      >;
      matchAll: (
        ...args: Parameters<typeof matchAlls>
      ) => sflow<
        ReturnType<typeof matchAlls> extends TransformStream<any, infer R>
          ? R
          : never
      >;
      replace: (
        ...args: Parameters<typeof replaces>
      ) => sflow<
        ReturnType<typeof replaces> extends TransformStream<any, infer R>
          ? R
          : never
      >;
      replaceAll: (
        ...args: Parameters<typeof replaceAlls>
      ) => sflow<
        ReturnType<typeof replaceAlls> extends TransformStream<any, infer R>
          ? R
          : never
      >;
    }
  : {};

type XsvEncodeFlow<T> = T extends Record<string, any>
  ? {
      csvFormat: (
        ...args: Parameters<typeof csvFormats>
      ) => sflow<
        ReturnType<typeof csvFormats> extends TransformStream<any, infer R>
          ? R
          : never
      >;
      tsvFormat: (
        ...args: Parameters<typeof tsvFormats>
      ) => sflow<
        ReturnType<typeof tsvFormats> extends TransformStream<any, infer R>
          ? R
          : never
      >;
    }
  : {};
type XsvDecodeFlow<T> = T extends string
  ? {
      csvParse<S extends string>(
        header: S
      ): sflow<Record<Split<S, ",">[number], any>>;
      csvParse<S extends string[]>(header: S): sflow<Record<S[number], any>>;
      tsvParse<S extends string>(
        header: S
      ): sflow<Record<Split<S, ",">[number], any>>;
      tsvParse<S extends string[]>(header: S): sflow<Record<S[number], any>>;
    }
  : {};

type ToResponse<T> =
  // toResponse
  T extends string | Uint8Array
    ? {
        toResponse: () => Response;
        text: () => Promise<string>;
        json: () => Promise<any>;
        blob: () => Promise<Blob>;
        arrayBuffer: () => Promise<ArrayBuffer>;
      }
    : {};

// maybe:
// subscribe (forEach+nils)
// find (filter+limit)
// distinct=uniq
//

// todo:
// catch, retry
//
// string stream process
// match
// replace
// join
//
export type sflowType<T extends sflow<any>> = T extends sflow<infer R>
  ? R
  : never;
export type sflow<T> = ReadableStream<T> &
  AsyncIterableIterator<T> &
  BaseFlow<T> &
  ArrayFlow<T> &
  DictionaryFlow<T> &
  StreamsFlow<T> &
  TextFlow<T> &
  XsvEncodeFlow<T> &
  XsvDecodeFlow<T> &
  ToResponse<T>;

/** stream flow */
export const sflow = <T>(src: FlowSource<T>): sflow<T> => {
  const r: ReadableStream<T> = toStream(src);
  // @ts-ignore todo
  return Object.assign(r, {
    _type: null as T,
    get readable() {
      return r;
    },
    // get writable() {
    //   DIE(new Error("WIP, merge into this stream"));
    //   return new WritableStream();
    // },
    through: (...args: Parameters<typeof _throughs>) =>
      sflow(r.pipeThrough(_throughs(...args))),
    mapAddField: (
      ...args: Parameters<typeof mapAddFields> // @ts-ignore
    ) => sflow(r.pipeThrough(mapAddFields(...args))),
    chunkBy: (...args: Parameters<typeof chunkBys>) =>
      sflow(r.pipeThrough(chunkBys(...args))),
    chunkIf: (...args: Parameters<typeof chunkIfs>) =>
      sflow(r.pipeThrough(chunkIfs(...args))),
    buffer: (...args: Parameters<typeof chunks>) =>
      sflow(r.pipeThrough(chunks(...args))),
    chunk: (...args: Parameters<typeof chunks>) =>
      sflow(r.pipeThrough(chunks(...args))),
    convolve: (...args: Parameters<typeof convolves>) =>
      sflow(r.pipeThrough(convolves(...args))),
    abort: (...args: Parameters<typeof terminates>) =>
      sflow(r.pipeThrough(terminates(...args))),
    chunkInterval: (...args: Parameters<typeof chunkIntervals>) =>
      sflow(r.pipeThrough(chunkIntervals(...args))),
    /** @deprecated */
    interval: (...args: Parameters<typeof chunkIntervals>) =>
      sflow(r.pipeThrough(chunkIntervals(...args))),
    debounce: (...args: Parameters<typeof debounces>) =>
      sflow(r.pipeThrough(debounces(...args))),
    done: (dst = nils<T>()) => r.pipeTo(dst),
    end: (dst = nils<T>()) => r.pipeTo(dst),
    filter: (...args: Parameters<typeof filters>) =>
      sflow(r.pipeThrough(filters(...args))),
    flatMap: (...args: Parameters<typeof flatMaps>) =>
      sflow(r.pipeThrough(flatMaps(...args))),
    flat: (
      ...args: Parameters<typeof flats> // @ts-expect-error array only
    ) => sflow(r.pipeThrough(flats(...args))),
    join: (...args: Parameters<typeof riffles>) =>
      sflow(r.pipeThrough(riffles(...args))),
    match: (
      ...args: Parameters<typeof matchs> // @ts-expect-error string only
    ) => sflow(r.pipeThrough(matchs(...args))),
    matchAll: (
      ...args: Parameters<typeof matchAlls> // @ts-expect-error string only
    ) => sflow(r.pipeThrough(matchAlls(...args))),
    replace: (
      ...args: Parameters<typeof replaces> // @ts-expect-error string only
    ) => sflow(r.pipeThrough(replaces(...args))),
    replaceAll: (
      ...args: Parameters<typeof replaceAlls> // @ts-expect-error string only
    ) => sflow(r.pipeThrough(replaceAlls(...args))),
    merge: (...args: FlowSource<T>[]) =>
      sflow(r.pipeThrough(merges(...args.map(sflow)))),
    confluence: (
      ...args: Parameters<typeof confluences> // @ts-expect-error streams only
    ) => sflow(r.pipeThrough(confluences(...args))),
    limit: (...args: Parameters<typeof limits>) =>
      sflow(r.pipeThrough(limits(...args))),
    head: (...args: Parameters<typeof heads>) =>
      sflow(r.pipeThrough(heads(...args))),
    map: (...args: Parameters<typeof maps>) =>
      sflow(r.pipeThrough(maps(...args))),
    log: (...args: Parameters<typeof logs>) =>
      sflow(r.pipeThrough(logs(...args))),
    uniq: (...args: Parameters<typeof uniqs>) =>
      sflow(r.pipeThrough(uniqs(...args))),
    uniqBy: (...args: Parameters<typeof uniqBys>) =>
      sflow(r.pipeThrough(uniqBys(...args))),
    unwind: (
      ...args: Parameters<typeof unwinds> // @ts-ignore
    ) => sflow(r.pipeThrough(unwinds(...args))),
    asyncMap: (...args: Parameters<typeof asyncMaps>) =>
      sflow(r.pipeThrough(asyncMaps(...args))),
    pMap: (...args: Parameters<typeof pMaps>) =>
      sflow(r.pipeThrough(pMaps(...args))),
    peek: (...args: Parameters<typeof peeks>) =>
      sflow(r.pipeThrough(peeks(...args))),
    riffle: (...args: Parameters<typeof riffles>) =>
      sflow(r.pipeThrough(riffles(...args))),
    forEach: (...args: Parameters<typeof forEachs>) =>
      sflow(r.pipeThrough(forEachs(...args))),
    reduce: (...args: Parameters<typeof reduces>) =>
      sflow(r.pipeThrough(reduces(...args))),
    reduceEmit: (...args: Parameters<typeof reduceEmits>) =>
      sflow(r.pipeThrough(reduceEmits(...args))),
    skip: (...args: Parameters<typeof skips>) =>
      sflow(r.pipeThrough(skips(...args))),
    slice: (...args: Parameters<typeof slices>) =>
      sflow(r.pipeThrough(slices(...args))),
    tail: (...args: Parameters<typeof tails>) =>
      sflow(r.pipeThrough(tails(...args))),
    tees: (...args: Parameters<typeof _tees>) =>
      sflow(r.pipeThrough(_tees(...args))),
    throttle: (...args: Parameters<typeof throttles>) =>
      sflow(r.pipeThrough(throttles(...args))),

    // line based data stream
    csvFormat: (
      ...args: Parameters<typeof csvFormats> // @ts-expect-error xsv
    ) => sflow(r.pipeThrough(csvFormats(...args))),
    tsvFormat: (
      ...args: Parameters<typeof tsvFormats> // @ts-expect-error xsv
    ) => sflow(r.pipeThrough(tsvFormats(...args))),
    csvParse: (
      ...args: Parameters<typeof csvParses> // @ts-expect-error xsv
    ) => sflow(r.pipeThrough(csvParses(...args))),
    tsvParse: (
      ...args: Parameters<typeof tsvParses> // @ts-expect-error xsv
    ) => sflow(r.pipeThrough(tsvParses(...args))),

    // prevents
    /** prevent upstream abort, ignore upstream errors   */
    preventAbort: () =>
      sflow(r.pipeThrough(throughs(), { preventAbort: true })),
    /** prevent upstream close */
    preventClose: () =>
      sflow(r.pipeThrough(throughs(), { preventClose: true })),
    /** prevent downstream cancel, ignore downstream errors */
    preventCancel: () =>
      sflow(r.pipeThrough(throughs(), { preventCancel: true })),

    // to promises
    toEnd: () => r.pipeTo(nils<T>()),
    toNil: () => r.pipeTo(nils<T>()),
    toArray: () => wseToArray(r),
    toCount: async () => (await wseToArray(r)).length, // TODO: optimize memory usage
    toFirst: () => wseToPromise(sflow(r).limit(1, { terminate: true })),
    toLast: () => wseToPromise(sflow(r).tail(1)),
    toOne: async () => {
      const a = await wseToArray(r);
      if (a.length > 1) DIEError(`Expect only 1 Item, but got ${a.length}`);
      return a[0];
    },
    toAtLeastOne: async () => {
      const a = await wseToArray(r);
      if (a.length > 1) DIEError(`Expect only 1 Item, but got ${a.length}`);
      if (a.length < 1) DIEError(`Expect at lest 1 Item, but got ${a.length}`);
      return a[0];
    },
    /** call console.log on every item */
    toLog: (...args: Parameters<typeof logs<T>>) =>
      sflow(r.pipeThrough(logs(...args))).done(),
    // toLatest: () => {
    //   const store = { value: undefined as T, readable: ReadableStream };
    //   const proxy = new DeepProxy(store, {
    //     get(target, key, receiver) {
    //       const val = Reflect.get(target, key, receiver);
    //       if (typeof val === "object" && val !== null) return this.nest(val);
    //       return val;
    //     },
    //   });
    //   const initialPromise = Promise.withResolvers();

    //   let initialized = false;
    //   store.readable = sflow(r).tees((r) =>
    //     r
    //       .forEach((e) => {
    //         store.value = e as T; // update store
    //         if (initialized) return;
    //         initialized = true;
    //         initialPromise.resolve(proxy);
    //       })
    //       .done()
    //   );
    //   return initialPromise.promise;
    // },
    // string stream process
    lines: (...args: Parameters<typeof lines>) =>
      // @ts-expect-error T should be string
      sflow(r.pipeThrough(lines(...args))),
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
  <T>(fn: (s: sflow<T>) => void | any): TransformStream<T, T>;
  <T>(stream?: WritableStream<T>): TransformStream<T, T>;
} = (arg) => {
  if (!arg) return new TransformStream();
  if (arg instanceof WritableStream) return tees((s) => s.pipeTo(arg));
  const fn = arg;
  const { writable, readable } = new TransformStream();
  const [a, b] = readable.tee();
  // @ts-ignore
  fn(sflow(a));
  return { writable, readable: b };
};
export const _throughs: {
  <T>(stream?: TransformStream<T, T>): TransformStream<T, T>;
  <T, R>(stream: TransformStream<T, R>): TransformStream<T, R>;
  <T, R>(fn: (s: sflow<T>) => FlowSource<R>): TransformStream<T, R>;
} = (arg: any) => {
  if (!arg) return new TransformStream();
  if (typeof arg !== "function") return throughs((s) => s.pipeThrough(arg));
  const fn = arg;
  const { writable, readable } = new TransformStream();
  return { writable, readable: sflow(fn(sflow(readable))) };
};
