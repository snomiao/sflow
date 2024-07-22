import type { Awaitable } from "./Awaitable";
import { sflow } from "./sflow";
type PageFetcher<Data, Cursor> = (
  cursor: Cursor
) => Awaitable<{ data: Data; next?: Cursor | null }>;
export function pageStream<Data, Cursor>(
  fetcher: PageFetcher<Data, Cursor>
): ReadableStream<Data> {
  let curr: Cursor;
  return new ReadableStream({
    pull: async (ctrl) => {
      const { data, next } = await fetcher(curr);
      if (null == next) return ctrl.close();
      curr = next;
      ctrl.enqueue(data);
    },
  });
}

export function pageFlow<Data, Cursor>(
  fetcher: PageFetcher<Data, Cursor>
): sflow<Data> {
  return sflow(pageStream(fetcher));
}
