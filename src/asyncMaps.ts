import type { Awaitable } from "./Awaitable";

type asyncMapOptions = {
  concurrency?: number;
};

/* map a stream by parallel, return them in execute finished order (return faster return first) */

export const asyncMaps: {
  <T, R>(
    fn: (x: T, i: number) => Awaitable<R>,
    options?: { concurrency?: number },
  ): TransformStream<T, R>;
  <T, R>(fn: (x: T, i: number) => Awaitable<R>): TransformStream<T, R>;
} = <T, R>(
  fn: (x: T, i: number) => Awaitable<R>,
  options: asyncMapOptions = {},
) => {
  let i = 0;
  const tasks = new Map<number, Awaitable<{ id: number; data: R }>>();
  return new TransformStream<T, R>({
    transform: async (chunk, ctrl) => {
      const id = i++;
      // enqueue
      tasks.set(
        id,
        (async () => fn(chunk, id))().then((data) => ({ id, data })),
      );
      // TODO: allow emit on tasks not full
      // emit fastest when tasks full
      if (tasks.size >= (options.concurrency ?? Infinity)) {
        const { id, data } = await Promise.race(tasks.values());
        tasks.delete(id);
        ctrl.enqueue(data);
      }
    },
    flush: async (ctrl) => {
      // emit fastest
      while (tasks.size) {
        const { id, data } = await Promise.race(tasks.values());
        tasks.delete(id);
        ctrl.enqueue(data);
      }
    },
  });
};
