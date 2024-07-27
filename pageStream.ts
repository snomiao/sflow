import type { Awaitable } from "./Awaitable";
export type PageFetcher<Data, Cursor> = (
  cursor: Cursor
) => Awaitable<{ data: Data; next?: Cursor | null }>;
export function pageStream<Data, Cursor>(
  initialQuery: Cursor,
  fetcher: PageFetcher<Data, Cursor>
): ReadableStream<Data> {
  let query: Cursor = initialQuery;
  return new ReadableStream({
    pull: async (ctrl) => {
      const ret = fetcher(query);

      // await only if ret is promise, to ensure performance
      const val = ret instanceof Promise ? await ret : ret;

      const { data, next } = val;
      ctrl.enqueue(data);
      if (null == next) return ctrl.close();
      query = next;
    },
  });
}
