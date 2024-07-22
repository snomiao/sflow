import type { Awaitable } from "./Awaitable";
export type PageFetcher<Data, Cursor> = (
  cursor: Cursor
) => Awaitable<{ data: Data; next?: Cursor | null }>;
export function pageStream<Data, Cursor>(
  initialCursor: Cursor,
  fetcher: PageFetcher<Data, Cursor>
): ReadableStream<Data> {
  let curr: Cursor = initialCursor;
  return new ReadableStream({
    pull: async (ctrl) => {
      const { data, next } = await fetcher(curr);
      if (null == next) return ctrl.close();
      curr = next;
      ctrl.enqueue(data);
    },
  });
}
