import type { Awaitable } from "./Awaitable";
import { type PageFetcher, pageStream } from "./pageStream";
import { sflow } from "./sflow";

export function pageFlow<Data, Cursor>(
  initialCursor: Awaitable<Cursor>,
  fetcher: PageFetcher<Data, Cursor>,
): sflow<Data> {
  return sflow(pageStream(initialCursor, fetcher));
}
