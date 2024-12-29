import type {
  GPU_STRUCT,
  MemoryType,
  MemoryTypeR,
  MemoryTypeV,
  MemoryTypeVF,
} from "../types.ts";
import type { NonEmpty } from "../internal/constraints.ts";

/**
 * A user-defined object that describes the fields of a structure.
 *
 * @example
 * { field1: { index: 0, type: Int32 }, field2: { index: 1, type: Vec2F } }
 */
export type StructDescriptor<S> = {
  [K in keyof S]: S[K] extends { type: infer T } ? {
      index: number;
      type: T extends MemoryType<infer R, infer V, infer VF> ? T : never;
    }
    : never;
};

export interface IStruct<S extends NonEmpty<StructDescriptor<S>>>
  extends MemoryType<StructR<S>, StructV<S>, never> {
  readonly type: typeof GPU_STRUCT;
  readonly fields: IStructFieldsOf<S>;
}

export type IStructFieldsOf<S extends NonEmpty<StructDescriptor<S>>> = {
  [K in keyof S]: IStructField<S, K>;
};

export interface IStructField<
  S extends NonEmpty<StructDescriptor<S>>,
  Key extends keyof S,
  T extends MemoryType<R, V, VF> = S[Key]["type"],
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF = MemoryTypeVF<T>,
> {
  readonly index: number;
  readonly name: Key;
  readonly type: T;
  readonly byteSize: number;
  readonly alignment: number;
  readonly offset: number;

  read(view: DataView, offset?: number): R;
  write(view: DataView, value: R, offset?: number): void;
  readAt(view: DataView, index: number, offset?: number): R;
  writeAt(view: DataView, index: number, value: R, offset?: number): void;
  viewAt(buffer: ArrayBuffer, index: number, offset?: number): V;
}

/**
 * A structure's object representation.
 */
export type StructR<S extends StructDescriptor<S>> = {
  [K in keyof S]: MemoryTypeR<S[K]["type"]>;
};

/**
 * A structure's view representation.
 */
export type StructV<S extends StructDescriptor<S>> = {
  [K in keyof S]: MemoryTypeV<S[K]["type"]>;
};
