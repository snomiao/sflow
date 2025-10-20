import type { FieldPathByValue, FieldPathValue } from "react-hook-form";

export type Unwinded<T, K> = T extends Record<string, unknown>
  ? K extends FieldPathByValue<T, ReadonlyArray<unknown>>
    ? {
        [key in K]: FieldPathValue<T, K> extends ReadonlyArray<infer U>
          ? U
          : never;
      } & Omit<T, K>
    : never
  : never;
