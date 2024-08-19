export type CacheOptions =
  | string
  | {
      /**
       * Key could step name,
       * or defaults to `new Error().stack` if you r lazy enough
       */
      key?: string;
    };

const jsonEquals = (a: any, b: any) =>
  new Set([a, b].map((e) => JSON.stringify(e))).size === 1;


