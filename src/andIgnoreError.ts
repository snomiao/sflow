import DIE from "phpdie";

export function andIgnoreError(regex: RegExp | string) {
  return (error: unknown) => (error?.message?.match(regex) ? null : DIE(error));
}
