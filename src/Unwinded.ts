import type { FieldPathByValue, FieldPathValue } from "react-hook-form";

export type Unwinded<T, K> = T extends Record<string, any>
  ? K extends FieldPathByValue<T, ReadonlyArray<any>>
    ? {
        [key in K]: FieldPathValue<T, K>[number];
      } & Omit<T, K>
    : never
  : never;
