import * as memory from "jsr:@garciat/wgpu-memory@1.2.2";

export type AnyMemoryType = memory.MemoryType<unknown, unknown, unknown>;

export type AnyFloatingPointMemoryType =
  | typeof memory.Float32
  | typeof memory.Float16;

export type AnyNumericMemoryType =
  | AnyFloatingPointMemoryType
  | typeof memory.Int32
  | typeof memory.Uint32;

export type AnyScalarMemoryType =
  | AnyNumericMemoryType
  | typeof memory.Bool;

export type AnyVectorType = memory.VectorType<AnyScalarMemoryType, 2 | 3 | 4>;

export type AnyMatrixType = memory.MatrixType<
  AnyFloatingPointMemoryType,
  2 | 3 | 4,
  2 | 3 | 4
>;

export type AnyArrayType = memory.ArrayType<AnyMemoryType, number>;

export type AnyStructType = memory.StructType<AnyStructDescriptorType>;

export type AnyStructDescriptorType = Record<
  string,
  { index: number; type: AnyMemoryType }
>;

export type MemoryTypeKey = AnyMemoryType["type"];

export type FloatingPointMemoryTypeKey = AnyFloatingPointMemoryType["type"];

export type ScalarMemoryTypeKey = AnyScalarMemoryType["type"];

export const FloatingPointMemoryTypeKeys: ReadonlySet<
  FloatingPointMemoryTypeKey
> = new Set([
  "f32",
  "f16",
]);

export const ScalarMemoryTypeKeys: ReadonlySet<ScalarMemoryTypeKey> = new Set([
  ...FloatingPointMemoryTypeKeys,
  "i32",
  "u32",
  "bool",
]);

export const MemoryTypeKeys: ReadonlySet<MemoryTypeKey> = new Set([
  ...ScalarMemoryTypeKeys,
  "vec2",
  "vec3",
  "vec4",
  "mat2x2",
  "mat3x3",
  "mat4x4",
  "array",
  "struct",
]);

export function parseMemoryTypeKey(key: string): MemoryTypeKey {
  if (!MemoryTypeKeys.has(key as MemoryTypeKey)) {
    throw new Error(`Unknown memory type: ${key}`);
  }
  return key as MemoryTypeKey;
}

export function typedObjectKeys<T extends Record<string, unknown>>(
  obj: T,
): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}
