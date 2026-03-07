# sflow TODO — Bullet Journal

> From comprehensive review on 2026-03-07. See `2026-03-07-review.md` for full analysis.

## Dependency Hygiene

- [x] Move `bson` to devDependencies (not imported at runtime)
- [x] Move `npm-run-all` to devDependencies (build tool only)
- [x] Move `ts-essentials` to devDependencies (types only)
- [x] Move `@types/d3` to devDependencies (types only)
- [x] Replace `rambda` with inline `sortBy`/`equals`/`minBy`/`maxBy` in `src/utils.ts` (saves 1.8 MB install)
- [x] Replace `d3` with `d3-dsv` in lib/d3 entry (saves 4.6 MB -> ~66 KB)
- [x] Remove `polyfill-text-encoder-stream` / `polyfill-text-decoder-stream` — use native `TextEncoderStream`/`TextDecoderStream` (saves 5.6 MB)

## Safe Defaults

- [x] Change default concurrency of `pMaps` from `Infinity` to 16
- [x] Change default concurrency of `asyncMaps` from `Infinity` to 16

## Performance

- [x] Use `minBy`/`maxBy` (O(N)) in `mergeAscends` and `mergeStreamsBy` instead of `sortBy` (O(N log N)) per emit
- [x] Simplify ordering validation to direct comparisons instead of `sortBy` on 2-element arrays

## Build & Bundle

- [ ] Consider per-operator code-splitting for full tree-shaking with chain API (future)
