import DIE from "phpdie";

export function flats<T>() {
  const emptyError = new Error(
    "Flatten for empty array [] in stream is not supported yet, To fix this error, you can add a .filter(array=>array.length) stage before flat"
  );

  return new TransformStream<T[], T>({
    transform: async (a, ctrl) => {
      a.length || DIE(emptyError);
      a.map((e) => ctrl.enqueue(e));
    },
  });
  // const t = new TransformStream<T, T>(
  //   undefined,
  //   { highWaterMark: 1 },
  //   { highWaterMark: 0 }
  // );
  // const writer = t.writable.getWriter();
  // const emptyError = new Error(
  //   "Flatten for empty array [] in stream is not supported yet"
  // );
  // const writable = new WritableStream<T[]>(
  //   {
  //     write: async (chunks, ctrl) => {
  //       chunks.length || DIE(emptyError);

  //       for await (const chunk of chunks) await writer.write(chunk);
  //     },
  //     close: () => writer.close(),
  //     abort: (reason) => writer.abort(reason),
  //   },
  //   { highWaterMark: 1 }
  // );
  // return { writable, readable: t.readable };
}
