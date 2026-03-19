/**
 * Lightweight replacements for react-hook-form's FieldPathByValue / FieldPathValue.
 * Only the subset needed by sflow (top-level keys) is implemented here.
 */

/**
 * All top-level keys of T whose value is assignable to V.
 */
export type FieldPathByValue<T, V> = {
  [K in keyof T & string]: T[K] extends V ? K : never;
}[keyof T & string];

/**
 * The value type at key K in T.
 */
export type FieldPathValue<T, K extends string> = K extends keyof T ? T[K] : never;
