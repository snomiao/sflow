import DIE from "phpdie";

export function andIgnoreError(regex: RegExp | string) {
  return (error: any) => (error?.message?.match(regex) ? null : DIE(error));
}
