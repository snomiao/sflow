import {
  from,
  merge,
  of,
  toArray,
  toPromise,
  toString,
} from "web-streams-extensions";

type Awaitable<T> = Promise<T> | T;
export function maps<T, R>(fn: (x: T, i: number) => Awaitable<R>) {
  let i = 0;
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => {
      ctrl.enqueue(await fn(chunk, i++));
    },
  });
}
export function peeks<T>(fn: (x: T, i: number) => Awaitable<void | any>) {
  let i = 0;
  return new TransformStream<T, T>({
    transform: async (chunk, ctrl) => {
      await fn(chunk, i);
      ctrl.enqueue(chunk);
    },
  });
}
export const tees: {
  <T>(fn: (s: ReadableStream<T>) => void | any): TransformStream<T, T>;
  <T>(stream: WritableStream<T>): TransformStream<T, T>;
} = (arg) => {
  if (arg instanceof WritableStream) return tees((s) => s.pipeTo(arg));
  const fn = arg;
  const { writable, readable } = new TransformStream();
  const [a, b] = readable.tee();
  fn(a);
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
      id = setTimeout(() => ctrl.enqueue(chunk), t);
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

export function filters<T>(): TransformStream<T, NonNullable<T>>;
export function filters<T>(fn: (x: T) => Awaitable<any>): TransformStream<T, T>;
export function filters(fn?: (x: any) => Awaitable<any>) {
  return new TransformStream({
    transform: async (chunk, ctrl) => {
      if (fn) {
        const shouldEnqueue = await fn(chunk);
        if (shouldEnqueue) ctrl.enqueue(chunk);
      } else {
        const isNull = undefined === chunk || null === chunk;
        if (!isNull) ctrl.enqueue(chunk);
      }
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
export function tails<T>(n = 1) {
  let chunks: T[] = [];
  return new TransformStream<T>({
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
  return new TransformStream<T>({
    transform: async (chunk, ctrl) => {
      ctrl.enqueue(chunk);
      if (!n--) ctrl.terminate();
    },
  });
}
export function skips<T>(n = 1) {
  return new TransformStream<T>({
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

export const merges: (
  concurrent?: number
) => <T>(
  src: ReadableStream<ReadableStream<T> | Promise<T>>
) => ReadableStream<T> = merge as any;

export { from, toArray, toPromise, toString };
