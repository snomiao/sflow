# SNOFLOW

stream-flow with type-safety piping paradigram through web-stream-kernels.

## Examples

### Simple Pipe style (clear piping syntax)

```ts
await sflow([1, 2, 3])
  .buffer(2)
  .debounce(100)
  .filter()
  .map((n) => [String(n)])
  .flat()
  .flatMap((n) => [String(n)])
  .tees((s) => s.pipeTo(nils()))
  .limit(1)
  .map(() => 1)
  .peek(() => {})
  .reduce(0, (a, b) => a + b)
  .skip(1)
  .tail(1)
  .throttle(100)
  .done();
```

### Using native WebStream, pipe throughs sflow kernels (Allow tree-shaking while bundle)

```ts
await new ReadableStream({
  start: (ctrl) => {
    [1, 2, 3].map((x) => ctrl.enqueue(x));
  },
})
  .pipeThrough(buffers(2))
  .pipeThrough(debounces(100))
  .pipeThrough(filters())
  .pipeThrough(maps((n) => [String(n)]))
  .pipeThrough(flats())
  .pipeThrough(flatMaps((n) => [String(n)]))
  .pipeThrough(teess((s) => s.pipeTo(nils())))
  .pipeThrough(limits(1))
  .pipeThrough(maps(() => 1))
  .pipeThrough(peeks(() => {}))
  .pipeThrough(
    reduces((a, b) => a + b),
    0,
  )
  .pipeThrough(skips(1))
  .pipeThrough(tails(1))
  .pipeThrough(throttles(100))
  .pipeTo(nils());
```

## Visual Demo

TODO

### Reference

- [Highland.js](https://caolan.github.io/highland/)
- [RxJS](https://rxjs.dev/)
