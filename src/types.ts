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

export const GPU_SCALAR_TYPES: ReadonlySet<GPUScalarType> = new Set([
  GPU_BOOL,
  GPU_I32,
  GPU_U32,
  GPU_F16,
  GPU_F32,
]);

export const GPU_FLOATING_POINT_TYPES: ReadonlySet<GPUFloatingPointType> =
  new Set([
    GPU_F16,
    GPU_F32,
  ]);

export type GPUBoolType = typeof GPU_BOOL;
export type GPUInt32Type = typeof GPU_I32;
export type GPUUint32Type = typeof GPU_U32;
export type GPUFloat16Type = typeof GPU_F16;
export type GPUFloat32Type = typeof GPU_F32;

export type GPUIntegerType = GPUInt32Type | GPUUint32Type;
export type GPUFloatingPointType = GPUFloat16Type | GPUFloat32Type;
export type GPUScalarType = GPUBoolType | GPUIntegerType | GPUFloatingPointType;
export type GPUVectorType = typeof GPU_VEC2 | typeof GPU_VEC3 | typeof GPU_VEC4;
export type GPUMatrixType =
  | typeof GPU_MAT2X2
  | typeof GPU_MAT3X3
  | typeof GPU_MAT4X4;
export type GPUArrayType = typeof GPU_ARRAY;
export type GPUStructureType = typeof GPU_STRUCT;
export type GPUType =
  | GPUScalarType
  | GPUVectorType
  | GPUMatrixType
  | GPUArrayType
  | GPUStructureType;

/**
 * @template R The read/write type.
 * @template V The view type.
 * @template VF The flat view type.
 */
export interface MemoryType<R, V, VF> {
  /**
   * The type of the type.
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

export interface VectorType<
  T extends MemoryType<R, V, VF> & { type: GPUScalarType },
  N extends 2 | 3 | 4,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
> extends MemoryType<TupN<R, N>, V, VF> {
  readonly shape: [N];
  readonly componentType: T;

  get(view: DataView, indices: [TupIndexN<N>], offset?: number): R;

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

export interface MatrixType<
  T extends MemoryType<R, V, VF> & { type: GPUFloatingPointType },
  Cols extends 2 | 3 | 4,
  Rows extends 2 | 3 | 4,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
> extends MemoryType<TupNM<R, Cols, Rows>, V, VF> {
  readonly shape: [Cols, Rows];
  readonly componentType: T;

  readAtFlat(
    view: DataView,
    index: number,
    offset?: number,
  ): TupCxR<R, Cols, Rows>;

  writeAtFlat(
    view: DataView,
    index: number,
    value: TupCxR<R, Cols, Rows>,
    offset?: number,
  ): void;

  get(
    view: DataView,
    indices: TupIndexNM<Cols, Rows>,
    offset?: number,
  ): R;

  set(
    view: DataView,
    indices: TupIndexNM<Cols, Rows>,
    value: R,
    offset?: number,
  ): void;

  getAt(
    view: DataView,
    column: TupIndexN<Cols>,
    row: TupIndexN<Rows>,
    offset?: number,
  ): R;

  setAt(
    view: DataView,
    column: TupIndexN<Cols>,
    row: TupIndexN<Rows>,
    value: R,
    offset?: number,
  ): void;

  getAtIndexed(
    view: DataView,
    index: number,
    column: TupIndexN<Cols>,
    row: TupIndexN<Rows>,
    offset?: number,
  ): R;

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
