import type { Awaitable } from "./Awaitable";
import { sflow } from "./sflow";
type PageFetcher<T> = (lastPage?: T) => Awaitable<T | null | undefined>;
export function pageStream<T>(fetcher: PageFetcher<T>): ReadableStream<T> {
  let lastPage: T;
  return new ReadableStream({
    pull: async (ctrl) => {
      const page = await fetcher(lastPage);
      if (null == page) return ctrl.close();
      ctrl.enqueue((lastPage = page));
    },
  });
}

export function pageFlow<T>(fetcher: PageFetcher<T>): sflow<T> {
  return sflow(pageStream(fetcher));
}
