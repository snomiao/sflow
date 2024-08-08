import type { Awaitable } from "./Awaitable";
/** Returns {data} */
export type PageFetcher<Data, Cursor> = (cursor: Cursor) => Awaitable<{
  // page data, generally should be a list that could be flatten later, note: null data will also be emitted
  data?: Data;
  // next page query
  next?: Cursor | null;
}>;
export function pageStream<Data, Cursor>(
  initialQuery: Cursor,
  fetcher: PageFetcher<Data, Cursor>
): ReadableStream<Data> {
  let query: Cursor = initialQuery;
  return new ReadableStream(
    {
      pull: async (ctrl) => {
        const ret = fetcher(query);
        const val = ret instanceof Promise ? await ret : ret;

        const { data, next } = val;
        ctrl.enqueue(data);
        if (null == next) return ctrl.close();
        query = next;
      },
    },
    { highWaterMark: 0 } // lazy page
  );
}
