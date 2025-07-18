import replaceAsync from "string-replace-async";
import { Awaitable } from "./Awaitable";
import { maps } from "./maps";

export const matchs: {
  (matcher: {
    [Symbol.match](string: string): RegExpMatchArray | null;
  }): TransformStream<string, RegExpMatchArray | null>;
} = (matcher) => {
  return new TransformStream({
    transform: (chunk, ctrl) => ctrl.enqueue(chunk.match(matcher)),
  });
};

export const matchAlls: {
  (regexp: RegExp): TransformStream<string, IterableIterator<RegExpExecArray>>;
} = (matcher) => {
  return new TransformStream({
    transform: (chunk, ctrl) => ctrl.enqueue(chunk.matchAll(matcher)),
  });
};

export const replaces: {
  // es5
  /**
 * Replaces text in a string, using a regular expression or search string.
 * @param searchValue A string or regular expression to search for.
 * @param replaceValue A string containing the text to replace. When the {@linkcode searchValue} is a `RegExp`, all matches are replaced if the `g` flag is set (or only those matches at the beginning, if the `y` flag is also present). Otherwise, only the first match of {@linkcode searchValue} is replaced.
 */
  (searchValue: string | RegExp, replaceValue: string): TransformStream<string, string>;

  /**
   * Replaces text in a string, using a regular expression or search string.
   * @param searchValue A string to search for.
   * @param replacer A function that returns the replacement text.
   */
  (searchValue: string | RegExp, replacer: (substring: string, ...args: any[]) => Awaitable<string>): TransformStream<string, string>;

  // es2015
  /**
   * Passes a string and {@linkcode replaceValue} to the `[Symbol.replace]` method on {@linkcode searchValue}. This method is expected to implement its own replacement algorithm.
   * @param searchValue An object that supports searching for and replacing matches within a string.
   * @param replaceValue The replacement text.
   */
  (searchValue: string | RegExp | { [Symbol.replace](string: string, replaceValue: string): string; }, replaceValue: string):
    TransformStream<string, string>;

  /**
   * Replaces text in a string, using an object that supports replacement within a string.
   * @param searchValue A object can search for and replace matches within a string.
   * @param replacer A function that returns the replacement text.
   */
  (searchValue: string | RegExp | { [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string; }, replacer: (substring: string, ...args: any[]) => Awaitable<string>):
    TransformStream<string, string>;

} = (searchValue, replacement) => {
  return maps((s) =>
    typeof replacement === "string"
      ? s.replace(
        searchValue as any,
        replacement,
      )
      : replaceAsync(s, searchValue as any, replacement),
  );
};

export const replaceAlls: {
  /**
   * Replace all instances of a substring in a string, using a regular expression or search string.
   * @param searchValue A string to search for.
   * @param replaceValue A string containing the text to replace for every successful match of searchValue in this string.
   */
  (
    searchValue: string | RegExp,
    replaceValue: string,
  ): TransformStream<string, string>;
  /**
   * Replace all instances of a substring in a string, using a regular expression or search string.
   * @param searchValue A string to search for.
   * @param replacer A function that returns the replacement text.
   */
  (
    searchValue: string | RegExp,
    replacer: (substring: string, ...args: any[]) => Promise<string> | string,
  ): TransformStream<string, string>;
} = (searchValue, replacement) => {
  return maps((s) =>
    typeof replacement === "string"
      ? s.replaceAll(searchValue, replacement)
      : replaceAsync(s, searchValue, replacement),
  );
};
