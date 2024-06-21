import {
  from,
  merge,
  of,
  toArray,
  toPromise,
  type ReadableLike,
} from "web-streams-extensions";

type Awaitable<T> = Promise<T> | T;

export function maps<T, R>(fn: (x: T, i: number) => Awaitable<R>) {
  let i = 0;
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => ctrl.enqueue(await fn(chunk, i++)),
  });
}
/* map a stream by parallel */
export function pMaps<T, R>(
  concurrent: number,
  fn: (x: T, i: number) => Awaitable<R>
) {
  let i = 0;
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => ctrl.enqueue(await fn(chunk, i++)),
  });
}
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
  <T>(stream: WritableStream<T>): TransformStream<T, T>;
} = (arg) => {
  if (arg instanceof WritableStream) return tees((s) => s.pipeTo(arg));
  const fn = arg;
  const { writable, readable } = new TransformStream();
  const [a, b] = readable.tee();
  // @ts-ignore
  fn(snoflow(a));
  return { writable, readable: b };
};

export const joins: {
  <T>(fn: (s: WritableStream<T>) => void | any): TransformStream<T, T>;
  <T>(stream: ReadableStream<T>): TransformStream<T, T>;
} = (arg) => {
  if (arg instanceof ReadableStream) return joins((s) => arg.pipeTo(s));
  const fn = arg;
  const s1 = new TransformStream();
  const s2 = new TransformStream();
  // writes
  const writable = s1.writable;
  fn(s2.writable);
  // reads
  const readable = merges()(of(s1.readable, s2.readable));
  //
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
    flush: async (ctrl) => {
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

export function flatMaps<T, R>(fn: (x: T, i: number) => Promise<R[]> | R[]) {
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
export function reduces<T, S>(
  state: S,
  fn: (state: S, x: T, i: number) => Promise<S> | S
) {
  let i = 0;
  return new TransformStream<T, S>({
    transform: async (chunk, ctrl) =>
      ctrl.enqueue((state = await fn(state, chunk, i++))),
  });
}
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
export const heads = limits;
export function limits<T>(n = 1) {
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      n-- && ctrl.enqueue(chunk);
    },
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
/** you could use flats to re-join buffers */
export function buffers<T>(n: number) {
  let chunks: T[] = [];
  if (n <= 0) throw new Error("Buffer size must be greater than 0");
  return new TransformStream<T, T[]>({
    transform: async (chunk, ctrl) => {
      chunks.push(chunk);
      if (chunks.length === n) {
        ctrl.enqueue(chunks);
        chunks = [];
      }
    },
  });
}

export const merges: (
  concurrent?: number
) => <T>(
  src: ReadableStream<ReadableStream<T> | Promise<T>>
) => ReadableStream<T> = merge as any;

export type snoflow<T> = ReadableStream<T> & {
  buffer: (...args: Parameters<typeof buffers<T>>) => snoflow<T[]>;
  debounce: (...args: Parameters<typeof debounces<T>>) => snoflow<T>;
  done: () => Promise<void>;
  filter(): snoflow<NonNullable<T>>;
  filter(fn: (x: T, i: number) => Awaitable<any>): snoflow<T>;
  flatMap: <R>(...args: Parameters<typeof flatMaps<T, R>>) => snoflow<R>;
  join(fn: (s: WritableStream<T>) => void | any): snoflow<T>;
  join(stream: ReadableStream<T>): snoflow<T>;
  limit: (...args: Parameters<typeof limits<T>>) => snoflow<T>;
  map: <R>(...args: Parameters<typeof maps<T, R>>) => snoflow<R>;
  peek: (...args: Parameters<typeof peeks<T>>) => snoflow<T>;
  pMap: <R>(...args: Parameters<typeof pMaps<T, R>>) => snoflow<R>;
  reduce: <S>(...args: Parameters<typeof reduces<T, S>>) => snoflow<S>;
  skip: (...args: Parameters<typeof skips<T>>) => snoflow<T>;
  tail: (...args: Parameters<typeof tails<T>>) => snoflow<T>;
  tees(fn: (s: snoflow<T>) => void | any): snoflow<T>;
  tees(stream: WritableStream<T>): snoflow<T>;
  throttle: (...args: Parameters<typeof throttles<T>>) => snoflow<T>;
  toArray: () => Promise<T[]>;
  toFirst: () => Promise<T>;
} & (T extends any[]
    ? { flat: (...args: Parameters<typeof flats<T>>) => snoflow<T[number]> }
    : {});

// @ts-ignore
export const snoflow: <T>(
  src:
    | Promise<T>
    | Iterable<T>
    | AsyncIterable<T>
    | (() => Iterable<T> | AsyncIterable<T>)
    | ReadableLike<T>
    | ReadableStream<T>
) => snoflow<T> = (src) => {
  const r = src instanceof ReadableStream ? src : from(src);
  return (
    // @ts-ignore
    /* @ts-ignore */ Object.assign(r, {
      buffer: (...args) => snoflow(r.pipeThrough(buffers(...args))), // @ts-ignore
      debounce: (...args) => snoflow(r.pipeThrough(debounces(...args))), // @ts-ignore
      done: () => r.pipeTo(nils()), // @ts-ignore
      filter: (...args) => snoflow(r.pipeThrough(filters(...args))), // @ts-ignore
      flatMap: (...args) => snoflow(r.pipeThrough(flatMaps(...args))), // @ts-ignore
      flat: (...args) => snoflow(r.pipeThrough(flats(...args))), // @ts-ignore
      join: (...args) => snoflow(r.pipeThrough(joins(...args))), // @ts-ignore
      limit: (...args) => snoflow(r.pipeThrough(limits(...args))), // @ts-ignore
      map: (...args) => snoflow(r.pipeThrough(maps(...args))), // @ts-ignore
      pMap: (...args) => snoflow(r.pipeThrough(pMmps(...args))), // @ts-ignore
      peek: (...args) => snoflow(r.pipeThrough(peeks(...args))), // @ts-ignore
      reduce: (...args) => snoflow(r.pipeThrough(reduces(...args))), // @ts-ignore
      skip: (...args) => snoflow(r.pipeThrough(skips(...args))), // @ts-ignore
      tail: (...args) => snoflow(r.pipeThrough(tails(...args))), // @ts-ignore
      tees: (...args) => snoflow(r.pipeThrough(tees(...args))), // @ts-ignore
      throttle: (...args) => snoflow(r.pipeThrough(throttles(...args))), // @ts-ignore
      toArray: () => toArray(r), // @ts-ignore
      toFirst: () => toPromise(snoflow(r).limit(1)), // @ts-ignore
    })
  );
};
