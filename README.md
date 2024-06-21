# Webstream Kernel

## Example: analyze all imports from a repo

```ts
import fs from "fs/promises";
import ignore from "ignore";
import imports from "imports-walk-ts";
import path from "path";
import { peekYaml } from "peek-log";
import { froms, filters, maps, nils } from "webstream-kernal";

const ignorer = ignore({})
  .add(await fs.readFile("./.gitignore", "utf8"))
  .createFilter();

await from(new Bun.Glob("./**/*.{ts,tsx,jsx,js}").scan())
  .pipeThrough(maps((f) => path.normalize(f)))
  .pipeThrough(filters(ignorer))
  .pipeThrough(maps((f) => fs.readFile(f, "utf8")))
  .pipeThrough(maps((c) => imports(c)))
  .pipeThrough(maps(peekYaml))
  .pipeTo(nils());

```