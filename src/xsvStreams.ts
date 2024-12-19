import { csvFormatBody, csvParse, tsvFormatBody, tsvParse } from "d3";
import type { Split } from "ts-toolbelt/out/String/Split";
import { lines } from "./lines";
import { maps } from "./maps";
import { skips } from "./skips";
import { throughs } from "./throughs";

export function csvFormats<S extends string>(
  header: S,
): TransformStream<Record<Split<S, ",">[number], any>, string>;
export function csvFormats<S extends string[]>(
  header: S,
): TransformStream<Record<S[number], any>, string>;
export function csvFormats(
  header: string | string[],
): TransformStream<Record<string, any>, string> {
  const _header = typeof header === "string" ? header.split(",") : header;
  return new TransformStream({
    start: (ctrl) => ctrl.enqueue(_header.join(",") + "\n"),
    transform: (chunk, ctrl) =>
      ctrl.enqueue(csvFormatBody([chunk], _header) + "\n"),
  });
}

export function csvParses<S extends string>(
  header: S,
): TransformStream<string, Record<Split<S, ",">[number], any>>;
export function csvParses<S extends string[]>(
  header: S,
): TransformStream<string, Record<S[number], any>>;
export function csvParses(
  header: string | string[],
): TransformStream<string, Record<string, any>> {
  const _header = typeof header === "string" ? header.split(",") : header;
  let i = 0;
  return throughs<string, Record<string, any>>((r) =>
    r
      .pipeThrough(lines({ EOL: "LF" }))
      .pipeThrough(skips(1))
      .pipeThrough(maps((line) => csvParse(_header + "\n" + line)[0])),
  );
}

export function tsvFormats<S extends string>(
  header: S,
): TransformStream<Record<Split<S, "\t">[number], any>, string>;
export function tsvFormats<S extends string[]>(
  header: S,
): TransformStream<Record<S[number], any>, string>;
export function tsvFormats(
  header: string | string[],
): TransformStream<Record<string, any>, string> {
  const sep = "\t";
  const _header = typeof header === "string" ? header.split(sep) : header;
  return new TransformStream({
    start: (ctrl) => ctrl.enqueue(_header.join(sep) + "\n"),
    transform: (chunk, ctrl) =>
      ctrl.enqueue(tsvFormatBody([chunk], _header) + "\n"),
  });
}

export function tsvParses<S extends string>(
  header: S,
): TransformStream<string, Record<Split<S, "\t">[number], any>>;
export function tsvParses<S extends string[]>(
  header: S,
): TransformStream<string, Record<S[number], any>>;
export function tsvParses(
  header: string | string[],
): TransformStream<string, Record<string, any>> {
  const _header = typeof header === "string" ? header.split("\t") : header;
  let i = 0;
  return throughs<string, Record<string, any>>((r) =>
    r
      .pipeThrough(lines({ EOL: "LF" }))
      .pipeThrough(skips(1))
      .pipeThrough(maps((line) => tsvParse(_header + "\n" + line)[0])),
  );
}
