import { sf } from ".";

/**
 * Flattens an array of arrays into a stream of values.
 * If the input is an empty array, it will throw an error.
 * To avoid this error, you can add a `.filter(array => array.length)` stage before
 *
 * @returns A TransformStream that flattens an array of arrays into a stream of values.
 */
export function flats<T>() {
  return sf.composers(sf.filters<T[]>((e) => e.length)).by(
    new TransformStream<T[], T>({
      transform: async (a, ctrl) => {
        a.map((e) => ctrl.enqueue(e));
      },
    }),
  );
}
