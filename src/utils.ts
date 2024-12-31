import { assertPositive } from "./internal/assert.ts";
import type { NonEmpty, Positive } from "./internal/constraints.ts";
import { ArrayTypeImpl } from "./array/array.ts";
import { StructTypeImpl } from "./struct/struct.ts";
import { compile as compileStruct } from "./struct/compile.ts";
import type { Float32Type } from "./scalar/f32.ts";
import type { Float16Type } from "./scalar/f16.ts";
import type { FloatingPointType, ScalarType } from "./scalar/mod.ts";
import { Vec2 } from "./vector/vec2.ts";
import { Vec3 } from "./vector/vec3.ts";
import { Vec4 } from "./vector/vec4.ts";
import type {
  ArrayType,
  GPUFloatingPointType,
  MatrixType,
  MemoryType,
  MemoryTypeBoundedVF,
  MemoryTypeR,
  MemoryTypeV,
  MemoryTypeVF,
  StructDescriptor,
  StructType,
  Vector2Type,
  Vector3Type,
  Vector4Type,
  VectorType,
} from "./types.ts";
import {
  Mat2x2F,
  Mat2x2H,
  Mat3x3F,
  Mat3x3H,
  Mat4x4F,
  Mat4x4H,
} from "./aliases.ts";

export function VectorOf<
  T extends MemoryType<R, V, VF> & ScalarType,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(componentType: T, shape: 2): Vector2Type<T, R, V, VF>;

export function VectorOf<
  T extends MemoryType<R, V, VF> & ScalarType,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(componentType: T, shape: 3): Vector3Type<T, R, V, VF>;

export function VectorOf<
  T extends MemoryType<R, V, VF> & ScalarType,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(componentType: T, shape: 4): Vector4Type<T, R, V, VF>;

export function VectorOf<
  T extends MemoryType<R, V, VF> & ScalarType,
  N extends 2 | 3 | 4,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(componentType: T, shape: N): VectorType<T, N, R, V, VF>;

export function VectorOf(
  componentType: ScalarType,
  shape: 2 | 3 | 4,
): VectorType<typeof componentType, typeof shape> {
  switch (shape) {
    case 2:
      return new Vec2(componentType);
    case 3:
      return new Vec3(componentType);
    case 4:
      return new Vec4(componentType);
    default:
      shape satisfies never;
      throw Error(`Vector shape not supported: ${shape}`);
  }
}

export function MatrixOf(
  componentType: Float32Type,
  shape: [2, 2],
): MatrixType<Float32Type, 2, 2>;

export function MatrixOf(
  componentType: Float32Type,
  shape: [3, 3],
): MatrixType<Float32Type, 3, 3>;

export function MatrixOf(
  componentType: Float32Type,
  shape: [4, 4],
): MatrixType<Float32Type, 4, 4>;

export function MatrixOf(
  componentType: Float16Type,
  shape: [2, 2],
): MatrixType<Float16Type, 2, 2>;

export function MatrixOf(
  componentType: Float16Type,
  shape: [3, 3],
): MatrixType<Float16Type, 3, 3>;

export function MatrixOf(
  componentType: Float16Type,
  shape: [4, 4],
): MatrixType<Float16Type, 4, 4>;

export function MatrixOf<
  T extends MemoryType<R, V, VF> & { type: GPUFloatingPointType },
  Cols extends 2 | 3 | 4,
  Rows extends 2 | 3 | 4,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(componentType: T, shape: [Cols, Rows]): MatrixType<T, Cols, Rows, R, V, VF>;

export function MatrixOf(
  componentType: FloatingPointType,
  shape: [2, 2] | [3, 3] | [4, 4],
): MatrixType<typeof componentType, (typeof shape)[0], (typeof shape)[1]> {
  if (shape[0] === 2 && shape[1] === 2) {
    switch (componentType.type) {
      case "f32":
        return Mat2x2F;
      case "f16":
        return Mat2x2H;
    }
  } else if (shape[0] === 3 && shape[1] === 3) {
    switch (componentType.type) {
      case "f32":
        return Mat3x3F;
      case "f16":
        return Mat3x3H;
    }
  } else if (shape[0] === 4 && shape[1] === 4) {
    switch (componentType.type) {
      case "f32":
        return Mat4x4F;
      case "f16":
        return Mat4x4H;
    }
  } else {
    throw Error(`Matrix shape not supported: ${shape}`);
  }
}

export function ArrayOf<
  T extends MemoryType<R, V, VF>,
  N extends number,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF = MemoryTypeVF<T>,
>(type: T, length: Positive<N>): ArrayType<T, N, R, V, VF> {
  return new ArrayTypeImpl(type, length);
}

export function StructOf<S extends NonEmpty<StructDescriptor<S>>>(
  descriptor: S,
  { compile = false }: { compile?: boolean } = {},
): StructType<S> {
  const type = new StructTypeImpl(descriptor);

  if (compile) {
    return compileStruct(type);
  } else {
    return type;
  }
}

/**
 * Allocate a new buffer for the given type.
 *
 * If `count` is greater than 1, then the corresponding array stride is taken into account.
 */
export function allocate(
  type: MemoryType<unknown, unknown, unknown>,
  count: number = 1,
): ArrayBuffer {
  assertPositive(count);
  return new ArrayBuffer(
    count === 1 ? type.byteSize : type.arrayStride * count,
  );
}

/**
 * Count the number of elements that fit in the buffer.
 *
 * If the buffer size is greater than the byte size of the type, then the array stride is used.
 */
export function count(
  type: MemoryType<unknown, unknown, unknown>,
  buffer: ArrayBufferLike | ArrayBufferView,
): number {
  if (buffer.byteLength === type.byteSize) {
    return 1;
  } else {
    return Math.floor(buffer.byteLength / type.arrayStride);
  }
}
