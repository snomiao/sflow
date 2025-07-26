import type { Awaitable } from "./Awaitable";

export function finds<T>(
    predicate: (value: T, index: number) => Awaitable<any>
): TransformStream<T, T> {
    let index = 0;
    let found = false;

    return new TransformStream<T, T>({
        async transform(chunk, controller) {
            if (found) return; // Already found, ignore further chunks

            const shouldEmit = await predicate(chunk, index++);
            if (shouldEmit) {
                found = true;
                controller.enqueue(chunk);
                controller.terminate(); // Stop the stream after finding the first match
            }
        }
    });
}
