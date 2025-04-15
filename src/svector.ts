import { sflow } from "./sflow";

/** stream vector */
export const svector = <T>(...src: ReadonlyArray<T>) => sflow<T>(src);
