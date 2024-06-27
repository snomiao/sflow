# SNOFLOW


## Examples

### Pipe style
```
await snoflow([1, 2, 3])
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
    .done()
```

### Using snoflow kernel by individual to allow e