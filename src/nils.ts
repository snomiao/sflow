export function nils<T = null>() {
  return new WritableStream<T>();
}

export function nil<T = null>() {
  return null as T;
}
