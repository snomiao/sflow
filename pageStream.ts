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
      const { data, next } = await fetcher(query);
      ctrl.enqueue(data);
      if (null == next) return ctrl.close();
      query = next;
    },
  });
}
