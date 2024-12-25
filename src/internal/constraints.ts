/**
 * Generic constraint for positive number constants.
 */
export type Positive<N extends number> = `${N}` extends `-${infer NP}` ? never
  : N extends 0 ? never
  : N;

/**
 * Generic constraint to ensure a record is not empty.
 */
export type NonEmpty<T> = keyof T extends never ? never : T;
