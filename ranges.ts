
export function ranges(
    minInclusive: number,
    maxExclusive: number
): ReadableStream<number>;
export function ranges(maxExclusive: number): ReadableStream<number>;
export function ranges(...args: number[]) {
    const [min, max]: [number, number] = args[1] != null ? [args[0], args[1]] : [0, args[0]];
    let i = min;
    return new ReadableStream({
        pull: (ctrl) => {
            ctrl.enqueue(i);
            if (++i >= max) ctrl.close();
        },
    });
}
