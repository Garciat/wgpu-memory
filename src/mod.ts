export type { MatrixType, MemoryType, VectorType } from "./types.ts";

export { ArrayType } from "./array/array.ts";

export type {
  IStruct,
  IStructField,
  IStructFieldsOf,
  StructDescriptor,
  StructR,
  StructV,
} from "./struct/types.ts";
export { Struct } from "./struct/struct.ts";
export { compile as compileStruct } from "./struct/compile.ts";

export { Vec2 } from "./vector/vec2.ts";
export { Vec3 } from "./vector/vec3.ts";
export { Vec4 } from "./vector/vec4.ts";

export {
  Bool,
  Float16,
  Float32,
  Int32,
  Mat2x2F,
  Mat2x2H,
  Mat3x3F,
  Mat3x3H,
  Mat4x4F,
  Mat4x4H,
  Uint32,
  Vec2B,
  Vec2F,
  Vec2H,
  Vec2I,
  Vec2U,
  Vec3B,
  Vec3F,
  Vec3H,
  Vec3I,
  Vec3U,
  Vec4B,
  Vec4F,
  Vec4H,
  Vec4I,
  Vec4U,
} from "./aliases.ts";

export { allocate, count } from "./utils.ts";
