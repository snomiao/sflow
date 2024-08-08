import DIE from "phpdie";

export class CacheHitError extends Error {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    this.name = "CacheHitError";
  }
  static nil: (reason: any) => PromiseLike<null> | null = (error) =>
    error instanceof CacheHitError ? null : DIE(error);
}