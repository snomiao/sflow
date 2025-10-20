import DIE from "phpdie";

export function andIgnoreError(regex: RegExp | string) {
  return (error: unknown) =>
    (error as { message?: string })?.message?.match(regex)
      ? null
      : DIE(error as Parameters<typeof DIE>[0]);
}
