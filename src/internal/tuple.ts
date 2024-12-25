export type Tup2<T> = [T, T];
export type Tup3<T> = [T, T, T];
export type Tup4<T> = [T, T, T, T];

export type TupN<T, N extends number> = N extends 0 ? []
  : N extends 1 ? [T]
  : N extends 2 ? [T, T]
  : N extends 3 ? [T, T, T]
  : N extends 4 ? [T, T, T, T]
  : TupDigits<T, Digits<N>>; // Delegate large tuples to recursive type

export type TupIndex<T> = T extends [infer _, ...infer Tail]
  ? Tail["length"] | TupIndex<Tail>
  : 0;

export function makeEmptyTupN<T, N extends number>(
  length: N,
): TupN<T, N> {
  return Array(length) as TupN<T, N>;
}

export function setTupN<T, N extends number>(
  tup: TupN<T, N>,
  index: number,
  value: T,
) {
  (tup as T[])[index] = value;
}

type Digits<T extends number> = `${T}` extends
  `${infer Head extends number}${infer Tail}` ? Tail extends "" ? [Head]
  : [Head, ...Digits<ToNumber<Tail>>]
  : [];

type TupDigits<T, DS extends unknown[]> = DS extends [infer D extends number]
  ? Tup0To9<T, D>
  : DS extends [...infer DS1, infer D extends number]
    ? TupConcat<TupTimes10<TupDigits<T, DS1>>, Tup0To9<T, D>>
  : never;

type Tup0To9<T, N extends number> = N extends 0 ? []
  : N extends 1 ? [T]
  : N extends 2 ? [T, T]
  : N extends 3 ? [T, T, T]
  : N extends 4 ? [T, T, T, T]
  : N extends 5 ? [T, T, T, T, T]
  : N extends 6 ? [T, T, T, T, T, T]
  : N extends 7 ? [T, T, T, T, T, T, T]
  : N extends 8 ? [T, T, T, T, T, T, T, T]
  : N extends 9 ? [T, T, T, T, T, T, T, T, T]
  : never;

type TupTimes10<T extends unknown[]> = [
  ...T,
  ...T,
  ...T,
  ...T,
  ...T,
  ...T,
  ...T,
  ...T,
  ...T,
  ...T,
];

type TupConcat<T extends unknown[], U extends unknown[]> = [...T, ...U];

type ToNumber<T extends string> = T extends `${infer N extends number}` ? N
  : never;
