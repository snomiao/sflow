import DIE from "@snomiao/die";
import { sortBy, type Ord } from "rambda";
import type { FieldPathByValue, FieldPathValue } from "react-hook-form";
import { unwind } from "unwind-array";
import {
  from as wseFrom,
  merge as wseMerge,
  toArray as wseToArray,
  toPromise as wseToPromise,
  type ReadableLike,
} from "web-streams-extensions";
type Awaitable<T> = Promise<T> | T;

/** @deprecated will remove next major version */
export const merges: (
  concurrent?: number
) => <T>(
  src: ReadableStream<ReadableStream<T> | Promise<T>>
) => ReadableStream<T> = wseMerge as any;

export function maps<T, R>(fn: (x: T, i: number) => Awaitable<R>) {
  let i = 0;
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => ctrl.enqueue(await fn(chunk, i++)),
  });
}

type Unwinded<T, K> = T extends Record<string, any>
  ? K extends FieldPathByValue<T, ReadonlyArray<any>>
    ? {
        [key in K]: FieldPathValue<T, K>[number];
      } & Omit<T, K>
    : never
  : never;
export function unwinds<
  T extends Record<string, any>,
  K extends keyof T & string
>(key: K) {
  return flatMaps<T, Unwinded<T, K>>(
    (e) => unwind(e, { path: key }) as Unwinded<T, K>[]
  );
}
export function mapAddFields<
  K extends string,
  T extends Record<string, any>,
  R extends any
>(key: K, fn: (x: T, i: number) => Awaitable<R>) {
  let i = 0;
  return new TransformStream<T, Omit<T, K> & { [key in K]: R }>({
    transform: async (chunk, ctrl) =>
      ctrl.enqueue({ ...chunk, [key]: await fn(chunk, i++) }),
  });
}
/* map a stream by parallel, return them in original order */
export const pMaps: {
  <T, R>(
    concurrent: number,
    fn: (x: T, i: number) => Awaitable<R>
  ): TransformStream<T, R>;
  <T, R>(fn: (x: T, i: number) => Awaitable<R>): TransformStream<T, R>;
} = <T, R>(
  arg1: number | ((x: T, i: number) => Awaitable<R>),
  arg2?: (x: T, i: number) => Awaitable<R>
) => {
  const concurrent = typeof arg1 === "number" ? arg1 : Infinity;
  const fn =
    typeof arg2 === "function"
      ? arg2
      : typeof arg1 === "function"
      ? arg1
      : DIE("NEVER");
  let i = 0;
  let promises: Awaitable<R>[] = [];
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => {
      promises.push(fn(chunk, i++));
      if (promises.length >= concurrent) ctrl.enqueue(await promises.shift());
    },
    flush: async (ctrl) => {
      while (promises.length) ctrl.enqueue(await promises.shift());
    },
  });
};
export function peeks<T>(fn: (x: T, i: number) => Awaitable<void | any>) {
  let i = 0;
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      await fn(chunk, i++);
      ctrl.enqueue(chunk);
    },
  });
}
export const tees: {
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

export const throughs: {
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

export const joins: {
  <T>(fn: (s: WritableStream<T>) => void | any): TransformStream<T, T>;
  <T>(stream?: ReadableStream<T>): TransformStream<T, T>;
} = (arg) => {
  if (!arg) return new TransformStream();
  if (arg instanceof ReadableStream) return joins((s) => arg.pipeTo(s));
  const fn = arg;
  const s1 = new TransformStream();
  const s2 = new TransformStream();
  // writes
  const writable = s1.writable;
  fn(s2.writable);
  // reads
  const readable = parallels(s1.readable, s2.readable);
  return { writable, readable };
};
export function nils<T>() {
  return new WritableStream<T>();
}
export function debounces<T>(t: number) {
  let id: number | null | Timer = null;
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      if (id) clearTimeout(id);
      id = setTimeout(() => {
        ctrl.enqueue(chunk);
        id = null;
      }, t);
    },
    flush: async () => {
      while (id) await new Promise((r) => setTimeout(r, t / 2));
    },
  });
}
export function throttles<T>(t: number, keepLast = true) {
  let id: number | null | Timer = null;
  let lasts: T[] = [];
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      if (id) {
        if (keepLast) lasts = [chunk];
        return;
      }
      lasts = [];
      ctrl.enqueue(chunk);
      id = setTimeout(() => {
        id = null;
        lasts.map((e) => ctrl.enqueue(e));
      }, t);
    },
    flush: async () => {
      // wait for last item enqueue, and then allow stream termination
      while (id) await new Promise((r) => setTimeout(r, t / 2));
    },
  });
}
export const filters: {
  <T>(): TransformStream<T, NonNullable<T>>;
  <T>(fn: (x: T, i: number) => Awaitable<any>): TransformStream<T, T>;
} = (fn?: (...args: any[]) => any) => {
  let i = 0;
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      if (fn) {
        const shouldEnqueue = await fn(chunk, i++);
        if (shouldEnqueue) ctrl.enqueue(chunk);
      } else {
        const isNull = undefined === chunk || null === chunk;
        if (!isNull) ctrl.enqueue(chunk);
      }
    },
  });
};
// from([1, 2, 3]).pipeThrough(filters());

export function flatMaps<T, R>(fn: (x: T, i: number) => Awaitable<R[]>) {
  let i = 0;
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => {
      (await fn(chunk, i++)).map((e) => ctrl.enqueue(e));
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

export const reduces: {
  <T, S>(
    state: S,
    fn: (state: S, x: T, i: number) => Awaitable<S>
  ): TransformStream<T, S>;
  <T>(fn: (state: T | null, x: T, i: number) => Awaitable<T>): TransformStream<
    T,
    T
  >;
} = (...args: any[]) => {
  const fn =
    typeof args[1] === "function"
      ? args[1]
      : typeof args[0] === "function"
      ? args[0]
      : null;
  let state = typeof args[1] === "function" ? args[0] : null;
  let i = 0;
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      return ctrl.enqueue((state = await fn(state, chunk, i++)));
    },
  });
};
export function tails<T>(n = 1) {
  let chunks: T[] = [];
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      chunks.push(chunk);
      if (chunks.length > n) chunks.shift();
    },
    flush: (ctrl) => {
      chunks.map((e) => ctrl.enqueue(e));
    },
  });
}
export const firsts = limits;
export function heads<T>(n = 1) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      n-- && ctrl.enqueue(chunk);
    },
  });
}
export function limits<T>(n = 1) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) =>
      n-- ? ctrl.enqueue(chunk) : ctrl.terminate(),
  });
}
/** Note: will abort immediately without signal */
export function aborts<T>(signal?: AbortSignal) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) =>
      signal?.aborted || !signal ? ctrl.terminate() : ctrl.enqueue(chunk),
  });
}
export function skips<T>(n = 1) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      if (n <= 0) ctrl.enqueue(chunk);
      else n--;
    },
  });
}
/** you could use flats to re-join buffers, default buffer length is Infinity, which will enqueue when upstream drain */
export function buffers<T>(n: number = Infinity) {
  let chunks: T[] = [];
  if (n <= 0) throw new Error("Buffer size must be greater than 0");
  return new TransformStream<T, T[]>({
    transform: async (chunk, ctrl) => {
      chunks.push(chunk);
      if (chunks.length >= n) ctrl.enqueue(chunks.splice(0, Infinity)); // clear chunks
    },
    flush: async (ctrl) => void (chunks.length && ctrl.enqueue(chunks)),
  });
}
/** like buffer, but collect item[] in interval (ms) */
export function intervals<T>(interval?: number) {
  let chunks: T[] = [];
  let id: null | ReturnType<typeof setInterval> = null;
  return new TransformStream<T, T[]>({
    start: (ctrl) => {
      if (interval) id = setInterval(() => ctrl.enqueue(chunks), interval);
    },
    transform: async (chunk, ctrl) => {
      if (!interval) ctrl.enqueue([chunk]);
      chunks.push(chunk);
    },
    flush: async (ctrl) => {
      if (chunks.length) ctrl.enqueue(chunks);
      id !== null && clearInterval(id);
    },
  });
}

const wseMerges: (
  concurrent?: number
) => <T>(
  src: ReadableStream<ReadableStream<T> | Promise<T>>
) => ReadableStream<T> = wseMerge as any;

export const parallels = <SRCS extends flowSource<any>[]>(...srcs: SRCS) =>
  snoflow(wseMerges()(wseFrom(srcs.map(snoflow)))) as snoflow<
    {
      [key in keyof SRCS]: SRCS[key] extends flowSource<infer T> ? T : never;
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
    readable: r,
    through: (...args: Parameters<typeof throughs>) =>
      snoflow(r.pipeThrough(throughs(...args))),
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
    tail: (...args: Parameters<typeof tails>) =>
      snoflow(r.pipeThrough(tails(...args))),
    tees: (...args: Parameters<typeof tees>) =>
      snoflow(r.pipeThrough(tees(...args))),
    throttle: (...args: Parameters<typeof throttles>) =>
      snoflow(r.pipeThrough(throttles(...args))),
    toArray: () => wseToArray(r),
    toCount: async () => (await wseToArray(r)).length,
    toFirst: () => wseToPromise(snoflow(r).limit(1)),
    toLast: () => wseToPromise(snoflow(r).tail(1)),
    [Symbol.asyncIterator]: streamAsyncIterator<T>,
  });
};

async function* streamAsyncIterator<T>(this: ReadableStream<T>) {
  const reader = this.getReader();
  try {
    while (1) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
