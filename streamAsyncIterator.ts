export async function* streamAsyncIterator<T>(this: ReadableStream<T>) {
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
