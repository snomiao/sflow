import { flatMaps } from "./flatMaps";

export function riffles<T>(sep: T): TransformStream<T, T> {
    return flatMaps((e) => [e, sep]);
}
