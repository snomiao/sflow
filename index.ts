import { sortBy, type Ord } from "rambda";
import {
  from as wseFrom,
  merge as wseMerge,
  toArray as wseToArray,
  toPromise as wseToPromise,
  type ReadableLike,
} from "web-streams-extensions";
import type { Awaitable } from "./Awaitable";
import type { Unwinded } from "./Unwinded";
import { aborts } from "./aborts";
import { buffers } from "./buffers";
import { debounces } from "./debounces";
import { filters } from "./filters";
import { flatMaps } from "./flatMaps";
import { flats } from "./flats";
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
    transform: async (chunk, ctrl) => void (n-- && ctrl.enqueue(chunk)),
  });
}
/** Currently will not pipe down more items after count satisfied, but still receives more items. */
export function limits<T>(n = 1, { terminate = false } = {}) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      (n-- && ctrl.enqueue(chunk)) || (terminate && ctrl.terminate());
    },
  });
}

const wseMerges: (
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

/** @deprecated wip */
export const mergeIncs = <T>(
  compareFn: (input: T) => Ord,
  ...srcs: ReadableStream<T>[]
) => {
  const slots = srcs.map(() => null as T | null);
  const pendings = srcs.map(
    () => Promise.withResolvers<void>() as PromiseWithResolvers<void> | null
  );
  let full = false;
  const { readable, writable } = new TransformStream();
  const w = writable.getWriter();
  Promise.all(
    srcs.map(async (src, i) => {
      for await (const item of snoflow(src)) {
        console.log(new Error().stack?.split("\n").toReversed()[0]);
        while (slots[i] != null) {
          pendings[i] = Promise.withResolvers<void>();
          await pendings[i]!.promise; // wait for this slot empty;
          pendings[i] = null;
        }
        console.log(new Error().stack?.split("\n").toReversed()[0]);
        slots[i] = item;
        console.log(new Error().stack?.split("\n").toReversed()[0]);
        full = slots.every((slot) => slot != null);
        console.log(new Error().stack?.split("\n").toReversed()[0]);
        const allDone = pendings.every((e) => !e);
        console.log(new Error().stack?.split("\n").toReversed()[0]);
        if (!full) continue;
        console.log(new Error().stack?.split("\n").toReversed()[0]);
        const fullSlots = slots.flatMap((e) => (e != null ? [e] : []));
        console.log(new Error().stack?.split("\n").toReversed()[0]);
        const minValue = sortBy(compareFn, fullSlots)[0];
        console.log(new Error().stack?.split("\n").toReversed()[0]);
        const minIndex = slots.findIndex((e) => e === minValue);
        console.log(new Error().stack?.split("\n").toReversed()[0]);
        w.write(minValue);
        console.log(new Error().stack?.split("\n").toReversed()[0]);
        slots[minIndex] = null;
        console.log(new Error().stack?.split("\n").toReversed()[0]);
        pendings[minIndex]?.resolve();
        console.log(new Error().stack?.split("\n").toReversed()[0]);
        // pendings[minIndex] = null;
      }
      // done
      console.log(new Error().stack?.split("\n").toReversed()[0]);
      pendings[i] = null;
      console.log(new Error().stack?.split("\n").toReversed()[0]);
      const allDone = pendings.every((e) => !e);
      console.log({ allDone });
      // if (allDone) {
      //   await w.close();
      // }
    })
  );
  return snoflow(readable);
};
type Reducer<S, T> = (state: S, x: T, i: number) => Awaitable<S>;
export type snoflow<T> = ReadableStream<T> &
  AsyncIterableIterator<T> & {
    _type: T;
    readable: ReadableStream<T>;
    writable: WritableStream<T>;
    buffer(...args: Parameters<typeof buffers<T>>): snoflow<T[]>;
    abort(...args: Parameters<typeof aborts<T>>): snoflow<T>;
    through(stream?: TransformStream<T, T>): snoflow<T>;
    through<R>(stream: TransformStream<T, R>): snoflow<R>;
    through<R>(fn: (s: snoflow<T>) => snoflow<R>): snoflow<R>;
    interval(...args: Parameters<typeof intervals<T>>): snoflow<T[]>;
    debounce(...args: Parameters<typeof debounces<T>>): snoflow<T>;
    done: (pipeTo?: WritableStream<T>) => Promise<void>;
    end: (pipeTo?: WritableStream<T>) => Promise<void>;
    filter(): snoflow<NonNullable<T>>;
    filter(fn: (x: T, i: number) => Awaitable<any>): snoflow<T>;
    flatMap<R>(...args: Parameters<typeof flatMaps<T, R>>): snoflow<R>;
    join(fn: (s: WritableStream<T>) => void | any): snoflow<T>;
    join(stream?: ReadableStream<T>): snoflow<T>;
    limit(...args: Parameters<typeof limits<T>>): snoflow<T>;
    head(...args: Parameters<typeof heads<T>>): snoflow<T>;
    map<R>(...args: Parameters<typeof maps<T, R>>): snoflow<R>;
    peek(...args: Parameters<typeof peeks<T>>): snoflow<T>;
    pMap<R>(concurr: number, fn: (x: T, i: number) => Awaitable<R>): snoflow<R>;
    pMap<R>(fn: (x: T, i: number) => Awaitable<R>): snoflow<R>;
    reduce<S>(state: S, fn: Reducer<S, T>): snoflow<S>;
    reduce(fn: (state: T | null, x: T, i: number) => Awaitable<T>): snoflow<T>;
    skip: (...args: Parameters<typeof skips<T>>) => snoflow<T>;
    slice: (...args: Parameters<typeof slices<T>>) => snoflow<T>;
    tail: (...args: Parameters<typeof tails<T>>) => snoflow<T>;
    tees(fn: (s: snoflow<T>) => void | any): snoflow<T>;
    tees(stream?: WritableStream<T>): snoflow<T>;
    throttle: (...args: Parameters<typeof throttles<T>>) => snoflow<T>;
    toArray: () => Promise<T[]>;
    toCount: () => Promise<number>;
    toFirst: () => Promise<T>;
    toLast: () => Promise<T>;
  } & (T extends any[]
    ? { flat: (...args: Parameters<typeof flats<T>>) => snoflow<T[number]> }
    : {}) &
  (T extends Record<string, any>
    ? {
        unwind<K extends keyof T & string>(key: K): snoflow<Unwinded<T, K>>;
        mapAddField: <K extends string, R>(
          ...args: Parameters<typeof mapAddFields<K, T, R>>
        ) => snoflow<Omit<T, K> & { [key in K]: R }>;
      }
    : {}) &
  (T extends string | Uint8Array
    ? {
        toResponse: () => Response;
        text: () => Promise<string>;
        json: () => Promise<any>;
        blob: () => Promise<Blob>;
        arrayBuffer: () => Promise<ArrayBuffer>;
      }
    : {});

export type flowSource<T> =
  | Promise<T>
  | Iterable<T>
  | AsyncIterable<T>
  | (() => Iterable<T> | AsyncIterable<T>)
  | ReadableLike<T>
  | ReadableStream<T>
  | snoflow<T>;

export const snoflow = <T>(src: flowSource<T>): snoflow<T> => {
  const r: ReadableStream<T> =
    src instanceof ReadableStream ? src : wseFrom(src);
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

/** merge multiple flow sources */
export const confluence = <SRCS extends flowSource<any>[]>(...srcs: SRCS) =>
  snoflow(wseMerges()(wseFrom(srcs.map(snoflow)))) as snoflow<
    {
      [key in keyof SRCS]: SRCS[key] extends flowSource<infer T> ? T : never;
    }[number]
  >;

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
