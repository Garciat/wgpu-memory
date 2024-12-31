import type { NonEmpty } from "./internal/constraints.ts";
import type {
  TupCxR,
  TupIndexN,
  TupIndexNM,
  TupN,
  TupNM,
} from "./internal/tuple.ts";

export const GPU_BOOL = "bool";
export const GPU_I32 = "i32";
export const GPU_U32 = "u32";
export const GPU_F16 = "f16";
export const GPU_F32 = "f32";
export const GPU_VEC2 = "vec2";
export const GPU_VEC3 = "vec3";
export const GPU_VEC4 = "vec4";
export const GPU_MAT2X2 = "mat2x2";
export const GPU_MAT3X3 = "mat3x3";
export const GPU_MAT4X4 = "mat4x4";
export const GPU_ARRAY = "array";
export const GPU_STRUCT = "struct";

export const GPU_SCALAR_TYPES: ReadonlySet<GPUType> = new Set([
  GPU_BOOL,
  GPU_I32,
  GPU_U32,
  GPU_F16,
  GPU_F32,
]);

export const GPU_FLOATING_POINT_TYPES: ReadonlySet<GPUType> = new Set([
  GPU_F16,
  GPU_F32,
]);

export type GPUType =
  | typeof GPU_BOOL
  | typeof GPU_I32
  | typeof GPU_U32
  | typeof GPU_F16
  | typeof GPU_F32
  | typeof GPU_VEC2
  | typeof GPU_VEC3
  | typeof GPU_VEC4
  | typeof GPU_MAT2X2
  | typeof GPU_MAT3X3
  | typeof GPU_MAT4X4
  | typeof GPU_ARRAY
  | typeof GPU_STRUCT;

/**
 * The base type for all memory types.
 *
 * @template R The read/write type.
 * @template V The view type.
 * @template VF The flat view type.
 */
export interface MemoryType<R, V, VF> {
  /**
   * The GPU type of the type.
   */
  readonly type: GPUType;

  /**
   * The size in bytes of the type. May include padding.
   */
  readonly byteSize: number;
  /**
   * The alignment in bytes of the type.
   */
  readonly alignment: number;
  /**
   * The stride in bytes for an array of the type.
   */
  readonly arrayStride: number;

  /**
   * @returns A WGSL-like representation of the type.
   */
  toString(): string;

  /**
   * @returns A JavaScript representation of the type.
   */
  toCode(namespace: string, indentation?: number): string;

  /**
   * @param view The view to read from.
   * @param [offset=0] The offset in bytes from the start of the view. Defaults to 0.
   * @returns The value read.
   */
  read(view: DataView, offset?: number): R;
  /**
   * @param view The view to write to.
   * @param value The value to write.
   * @param [offset=0] The offset in bytes from the start of the view. Defaults to 0.
   */
  write(view: DataView, value: R, offset?: number): void;

  /**
   * @param view The view to read from.
   * @param index The index of the element to read. The index is multiplied by the stride.
   * @param [offset=0] The offset in bytes from the start of the view. Defaults to 0.
   * @returns The value read.
   */
  readAt(view: DataView, index: number, offset?: number): R;
  /**
   * @param view The view to write to.
   * @param index The index of the element to write. The index is multiplied by the stride.
   * @param value The value to write.
   * @param [offset=0] The offset in bytes from the start of the view. Defaults to 0.
   */
  writeAt(view: DataView, index: number, value: R, offset?: number): void;

  /**
   * @param buffer The buffer to create the view from.
   * @param [offset=0] The offset in bytes from the start of the buffer. Defaults to 0.
   * @param [length=1] The length in bytes of the view. Defaults to 1.
   * @returns The view created. It includes alignment padding.
   */
  view(buffer: ArrayBuffer, offset?: number, length?: number): VF;
  /**
   * @param buffer The buffer to create the view from.
   * @param index The index of the element to view. The index is multiplied by the stride.
   * @param [offset=0] The offset in bytes from the start of the buffer. Defaults to 0.
   * @returns The view created. It does NOT include alignment padding.
   */
  viewAt(buffer: ArrayBuffer, index: number, offset?: number): V;
}

type MemoryTypeArgs<T> = T extends MemoryType<infer R, infer V, infer VF>
  ? [R, V, VF]
  : never;

export type MemoryTypeR<T> = MemoryTypeArgs<T>[0];
export type MemoryTypeV<T> = MemoryTypeArgs<T>[1];
export type MemoryTypeVF<T> = MemoryTypeArgs<T>[2];

export type MemoryTypeBoundedVF<T, V> = T extends
  MemoryType<infer R, V, infer VF extends V> ? VF
  : never;

export interface ScalarType<T, V, VF> extends MemoryType<T, V, VF> {
}

export type AnyFloatingPointType =
  | Float32Type
  | Float16Type;

export type AnyScalarType =
  | BoolType
  | Int32Type
  | Uint32Type
  | Float32Type
  | Float16Type;

/**
 * The 32-bit floating-point type.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#floating-point-types
 */
export interface Float32Type
  extends ScalarType<number, Float32Array, Float32Array> {
  /**
   * @inheritdoc
   */
  readonly type: typeof GPU_F32;

  /**
   * @inheritdoc
   */
  readonly byteSize: 4;

  /**
   * @inheritdoc
   */
  readonly alignment: 4;

  /**
   * @inheritdoc
   */
  readonly arrayStride: 4;
}

/**
 * The 16-bit floating-point type.
 *
 * @experimental Float16 is not yet standard.
 * @see https://github.com/tc39/proposal-float16array
 * @see https://gpuweb.github.io/gpuweb/wgsl/#floating-point-types
 */
export interface Float16Type
  extends ScalarType<number, Float16Array, Float16Array> {
  /**
   * @inheritdoc
   */
  readonly type: typeof GPU_F16;

  /**
   * @inheritdoc
   */
  readonly byteSize: 2;

  /**
   * @inheritdoc
   */
  readonly alignment: 2;

  /**
   * @inheritdoc
   */
  readonly arrayStride: 2;
}

/**
 * The 32-bit signed integer type.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#integer-types
 */
export interface Int32Type extends ScalarType<number, Int32Array, Int32Array> {
  /**
   * @inheritdoc
   */
  readonly type: typeof GPU_I32;

  /**
   * @inheritdoc
   */
  readonly byteSize: 4;

  /**
   * @inheritdoc
   */
  readonly alignment: 4;

  /**
   * @inheritdoc
   */
  readonly arrayStride: 4;
}

/**
 * The 32-bit unsigned integer type.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#integer-types
 */
export interface Uint32Type
  extends ScalarType<number, Uint32Array, Uint32Array> {
  /**
   * @inheritdoc
   */
  readonly type: typeof GPU_U32;

  /**
   * @inheritdoc
   */
  readonly byteSize: 4;

  /**
   * @inheritdoc
   */
  readonly alignment: 4;

  /**
   * @inheritdoc
   */
  readonly arrayStride: 4;
}

/**
 * The boolean type.
 *
 * NOTE: Bool is not host-shareable in WGSL.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#bool-type
 * @see https://gpuweb.github.io/gpuweb/wgsl/#host-shareable
 */
export interface BoolType
  extends ScalarType<boolean, Uint32Array, Uint32Array> {
  /**
   * @inheritdoc
   */
  readonly type: typeof GPU_BOOL;

  /**
   * @inheritdoc
   * @see https://gpuweb.github.io/gpuweb/wgsl/#why-is-bool-4-bytes
   */
  readonly byteSize: 4;

  /**
   * @inheritdoc
   * @see https://gpuweb.github.io/gpuweb/wgsl/#why-is-bool-4-bytes
   */
  readonly alignment: 4;

  /**
   * @inheritdoc
   * @see https://gpuweb.github.io/gpuweb/wgsl/#why-is-bool-4-bytes
   */
  readonly arrayStride: 4;
}

/**
 * An array of `N` elements of type `T`.
 *
 * @template T The element type.
 * @template N The element count.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#array-types
 */
export interface ArrayType<
  T extends MemoryType<R, V, VF>,
  N extends number,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF = MemoryTypeVF<T>,
> extends MemoryType<TupN<R, N>, TupN<V, N>, VF> {
  /**
   * @inheritdoc
   */
  readonly type: typeof GPU_ARRAY;

  /**
   * The element type of the array.
   */
  readonly elementType: T;

  /**
   * The element count of the array.
   */
  readonly elementCount: N;

  /**
   * @param view The view to read from.
   * @param index The index of the element to read.
   * @param offset The offset in bytes from the start of the view.
   * @returns The value read.
   */
  get(view: DataView, index: number, offset?: number): R;

  /**
   * @param view The view to write to.
   * @param index The index of the element to write.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  set(view: DataView, index: number, value: R, offset?: number): void;
}

/**
 * The base type for vectors.
 *
 * @template T The component type. Must be a scalar type.
 * @template N The shape of the vector.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#vector-types
 */
export interface VectorType<
  T extends MemoryType<R, V, VF> & AnyScalarType,
  N extends 2 | 3 | 4,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
> extends MemoryType<TupN<R, N>, V, VF> {
  /**
   * The shape of the vector.
   */
  readonly shape: [N];

  /**
   * The component type of the vector.
   */
  readonly componentType: T;

  /**
   * @param view The view to read from.
   * @param indices The indices of the elements to read.
   * @param offset The offset in bytes from the start of the view.
   * @returns The value read.
   */
  get(view: DataView, indices: [TupIndexN<N>], offset?: number): R;

  /**
   * @param view The view to write to.
   * @param indices The indices of the elements to write.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  set(
    view: DataView,
    indices: [TupIndexN<N>],
    value: R,
    offset?: number,
  ): void;

  /**
   * @returns The offset of the given indices from the start of the vector.
   */
  offset(indices: [TupIndexN<N>]): number;
}

/**
 * The 2-component vector type.
 */
export interface Vector2Type<
  T extends MemoryType<R, V, VF> & AnyScalarType,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
> extends VectorType<T, 2, R, V, VF> {
  /**
   * @inheritdoc
   */
  readonly type: typeof GPU_VEC2;

  /**
   * @inheritdoc
   */
  readonly shape: [2];

  /**
   * The offset of the X component from the start of the vector.
   */
  readonly offsetX: number;

  /**
   * The offset of the Y component from the start of the vector.
   */
  readonly offsetY: number;

  /**
   * @param view The view to read from.
   * @param offset The offset in bytes from the start of the view.
   * @returns The X component read.
   */
  getX(view: DataView, offset?: number): R;

  /**
   * @param view The view to read from.
   * @param offset The offset in bytes from the start of the view.
   * @returns The Y component read.
   */
  getY(view: DataView, offset?: number): R;

  /**
   * Writes the X component to the view.
   *
   * @param view The view to write to.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  setX(view: DataView, value: R, offset?: number): void;

  /**
   * Writes the Y component to the view.
   *
   * @param view The view to write to.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  setY(view: DataView, value: R, offset?: number): void;
}

/**
 * The 3-component vector type.
 */
export interface Vector3Type<
  T extends MemoryType<R, V, VF> & AnyScalarType,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
> extends VectorType<T, 3, R, V, VF> {
  /**
   * @inheritdoc
   */
  readonly type: typeof GPU_VEC3;

  /**
   * @inheritdoc
   */
  readonly shape: [3];

  /**
   * The offset of the X component from the start of the vector.
   */
  readonly offsetX: number;

  /**
   * The offset of the Y component from the start of the vector.
   */
  readonly offsetY: number;

  /**
   * The offset of the Z component from the start of the vector.
   */
  readonly offsetZ: number;

  /**
   * @param view The view to read from.
   * @param offset The offset in bytes from the start of the view.
   * @returns The X component read.
   */
  getX(view: DataView, offset?: number): R;

  /**
   * @param view The view to read from.
   * @param offset The offset in bytes from the start of the view.
   * @returns The Y component read.
   */
  getY(view: DataView, offset?: number): R;

  /**
   * @param view The view to read from.
   * @param offset The offset in bytes from the start of the view.
   * @returns The Z component read.
   */
  getZ(view: DataView, offset?: number): R;

  /**
   * Writes the X component to the view.
   *
   * @param view The view to write to.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  setX(view: DataView, value: R, offset?: number): void;

  /**
   * Writes the Y component to the view.
   *
   * @param view The view to write to.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  setY(view: DataView, value: R, offset?: number): void;

  /**
   * Writes the Z component to the view.
   *
   * @param view The view to write to.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  setZ(view: DataView, value: R, offset?: number): void;
}

/**
 * The 4-component vector type.
 */
export interface Vector4Type<
  T extends MemoryType<R, V, VF> & AnyScalarType,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
> extends VectorType<T, 4, R, V, VF> {
  /**
   * @inheritdoc
   */
  readonly type: typeof GPU_VEC4;

  /**
   * @inheritdoc
   */
  readonly shape: [4];

  /**
   * The offset of the X component from the start of the vector.
   */
  readonly offsetX: number;

  /**
   * The offset of the Y component from the start of the vector.
   */
  readonly offsetY: number;

  /**
   * The offset of the Z component from the start of the vector.
   */
  readonly offsetZ: number;

  /**
   * The offset of the W component from the start of the vector.
   */
  readonly offsetW: number;

  /**
   * @param view The view to read from.
   * @param offset The offset in bytes from the start of the view.
   * @returns The X component read.
   */
  getX(view: DataView, offset?: number): R;

  /**
   * @param view The view to read from.
   * @param offset The offset in bytes from the start of the view.
   * @returns The Y component read.
   */
  getY(view: DataView, offset?: number): R;

  /**
   * @param view The view to read from.
   * @param offset The offset in bytes from the start of the view.
   * @returns The Z component read.
   */
  getZ(view: DataView, offset?: number): R;

  /**
   * @param view The view to read from.
   * @param offset The offset in bytes from the start of the view.
   * @returns The W component read.
   */
  getW(view: DataView, offset?: number): R;

  /**
   * Writes the X component to the view.
   *
   * @param view The view to write to.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  setX(view: DataView, value: R, offset?: number): void;

  /**
   * Writes the Y component to the view.
   *
   * @param view The view to write to.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  setY(view: DataView, value: R, offset?: number): void;

  /**
   * Writes the Z component to the view.
   *
   * @param view The view to write to.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  setZ(view: DataView, value: R, offset?: number): void;

  /**
   * Writes the W component to the view.
   *
   * @param view The view to write to.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  setW(view: DataView, value: R, offset?: number): void;
}

/**
 * The base type for matrices.
 *
 * @template T The component type. Must be a scalar type.
 * @template Cols The number of columns.
 * @template Rows The number of rows.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#matrix-types
 */
export interface MatrixType<
  T extends MemoryType<R, V, VF> & AnyFloatingPointType,
  Cols extends 2 | 3 | 4,
  Rows extends 2 | 3 | 4,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
> extends MemoryType<TupNM<R, Cols, Rows>, V, VF> {
  /**
   * The type of the matrix.
   */
  readonly type: typeof GPU_MAT2X2 | typeof GPU_MAT3X3 | typeof GPU_MAT4X4;

  /**
   * The shape of the matrix.
   */
  readonly shape: [Cols, Rows];

  /**
   * The component type of the matrix.
   */
  readonly componentType: T;

  /**
   * Reads all of the elements of the matrix into a flat array.
   *
   * @param view The view to read from.
   * @param indices The indices of the element to read.
   * @param offset The offset in bytes from the start of the view.
   * @returns The values read.
   */
  readAtFlat(
    view: DataView,
    index: number,
    offset?: number,
  ): TupCxR<R, Cols, Rows>;

  /**
   * Writes all of the elements of the matrix from a flat array.
   *
   * @param view The view to write to.
   * @param value The values to write.
   * @param offset The offset in bytes from the start of the view.
   */
  writeAtFlat(
    view: DataView,
    index: number,
    value: TupCxR<R, Cols, Rows>,
    offset?: number,
  ): void;

  /**
   * @param view The view to read from.
   * @param indices The indices of the elements to read.
   * @param offset The offset in bytes from the start of the view.
   * @returns The value read.
   */
  get(
    view: DataView,
    indices: TupIndexNM<Cols, Rows>,
    offset?: number,
  ): R;

  /**
   * @param view The view to write to.
   * @param indices The indices of the elements to write.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  set(
    view: DataView,
    indices: TupIndexNM<Cols, Rows>,
    value: R,
    offset?: number,
  ): void;

  /**
   * @param view The view to read from.
   * @param column The column index of the element to read.
   * @param row The row index of the element to read.
   * @param offset The offset in bytes from the start of the view.
   * @returns The value read.
   */
  getAt(
    view: DataView,
    column: TupIndexN<Cols>,
    row: TupIndexN<Rows>,
    offset?: number,
  ): R;

  /**
   * @param view The view to write to.
   * @param column The column index of the element to write.
   * @param row The row index of the element to write.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  setAt(
    view: DataView,
    column: TupIndexN<Cols>,
    row: TupIndexN<Rows>,
    value: R,
    offset?: number,
  ): void;

  /**
   * @param view The view to read from.
   * @param index The index of the matrix to read.
   * @param column The column index of the element to read.
   * @param row The row index of the element to read.
   * @param offset The offset in bytes from the start of the view.
   * @returns The value read.
   */
  getAtIndexed(
    view: DataView,
    index: number,
    column: TupIndexN<Cols>,
    row: TupIndexN<Rows>,
    offset?: number,
  ): R;

  /**
   * @param view The view to write to.
   * @param index The index of the matrix to write.
   * @param column The column index of the element to write.
   * @param row The row index of the element to write.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  setAtIndexed(
    view: DataView,
    index: number,
    column: TupIndexN<Cols>,
    row: TupIndexN<Rows>,
    value: R,
    offset?: number,
  ): void;

  /**
   * @returns The offset of the given indices from the start of the matrix.
   */
  offset(indices: TupIndexNM<Cols, Rows>): number;
}

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

/**
 * A structure type.
 *
 * @template S The structure descriptor.
 */
export interface StructType<S extends NonEmpty<StructDescriptor<S>>>
  extends MemoryType<StructR<S>, StructV<S>, never> {
  /**
   * @inheritdoc
   */
  readonly type: typeof GPU_STRUCT;

  /**
   * The fields of the structure.
   */
  readonly fields: StructFieldsOf<S>;
}

/**
 * The fields of a structure, accessible by field name.
 */
export type StructFieldsOf<S extends NonEmpty<StructDescriptor<S>>> = {
  readonly [K in keyof S]: StructField<S, K>;
};

/**
 * A field of a structure.
 *
 * @template S The structure descriptor.
 * @template Key The field name.
 */
export interface StructField<
  S extends NonEmpty<StructDescriptor<S>>,
  Key extends keyof S,
  T extends MemoryType<R, V, VF> = S[Key]["type"],
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF = MemoryTypeVF<T>,
> {
  /**
   * The index of the field in the structure.
   */
  readonly index: number;

  /**
   * The name of the field.
   */
  readonly name: Key;

  /**
   * The type of the field.
   */
  readonly type: T;

  /**
   * The size in bytes of the field.
   */
  readonly byteSize: number;

  /**
   * The alignment in bytes of the field.
   */
  readonly alignment: number;

  /**
   * The offset in bytes of the field from the start of the structure.
   */
  readonly offset: number;

  /**
   * Reads the field's value from the view.
   *
   * @param view The view to read from.
   * @param offset The offset in bytes from the start of the view.
   * @returns The value read.
   */
  read(view: DataView, offset?: number): R;

  /**
   * Writes the field's value to the view.
   *
   * @param view The view to write to.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  write(view: DataView, value: R, offset?: number): void;

  /**
   * Reads the field's value from the view at the given index.
   *
   * @param view The view to read from.
   * @param index The index of the structure.
   * @param offset The offset in bytes from the start of the view.
   * @returns The value read.
   */
  readAt(view: DataView, index: number, offset?: number): R;

  /**
   * Writes the field's value to the view at the given index.
   *
   * @param view The view to write to.
   * @param index The index of the structure.
   * @param value The value to write.
   * @param offset The offset in bytes from the start of the view.
   */
  writeAt(view: DataView, index: number, value: R, offset?: number): void;

  /**
   * Creates a view of the field.
   *
   * @param buffer The buffer to create the view from.
   * @param offset The offset in bytes from the start of the buffer.
   * @param length The length in bytes of the view.
   * @returns The view created.
   */
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
