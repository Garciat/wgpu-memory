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
export type GPUIntegerType = typeof GPU_I32 | typeof GPU_U32;
export type GPUFloatingPointType = typeof GPU_F16 | typeof GPU_F32;
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

export interface IType<R, V> {
  type: GPUType;
  byteSize: number;
  alignment: number;
  read(view: DataView, offset?: number): R;
  write(view: DataView, value: R, offset?: number): void;
  readAt(view: DataView, index: number, offset?: number): R;
  writeAt(view: DataView, index: number, value: R, offset?: number): void;
  view(buffer: ArrayBuffer, offset?: number, length?: number): V;
}

export type ITypeR<T> = T extends IType<infer R, infer V> ? R : never;

export type ITypeV<T> = T extends IType<infer R, infer V> ? V : never;

export type Tup2<T> = [T, T];
export type Tup3<T> = [T, T, T];
export type Tup4<T> = [T, T, T, T];
