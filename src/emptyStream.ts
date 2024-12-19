export const emptyStream = () =>
  new ReadableStream({ start: (c) => c.close() });
