import { assertPositive } from "./internal/assert.ts";
import type { NonEmpty, Positive } from "./internal/constraints.ts";
import { ArrayTypeImpl } from "./array/array.ts";
import { StructTypeImpl } from "./struct/struct.ts";
import { compile as compileStruct } from "./struct/compile.ts";
import { Vec2 } from "./vector/vec2.ts";
import { Vec3 } from "./vector/vec3.ts";
import { Vec4 } from "./vector/vec4.ts";
import type {
  AnyFloatingPointType,
  AnyScalarType,
  ArrayType,
  Float16Type,
  Float32Type,
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

/**
 * Create a new 2-vector type from the given type.
 *
 * @param componentType The component type.
 */
export function VectorOf<
  T extends MemoryType<R, V, VF> & AnyScalarType,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(componentType: T, shape: 2): Vector2Type<T, R, V, VF>;

/**
 * Create a new 3-vector type from the given type.
 *
 * @param componentType The component type.
 */
export function VectorOf<
  T extends MemoryType<R, V, VF> & AnyScalarType,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(componentType: T, shape: 3): Vector3Type<T, R, V, VF>;

/**
 * Create a new 4-vector type from the given type.
 *
 * @param componentType The component type.
 */
export function VectorOf<
  T extends MemoryType<R, V, VF> & AnyScalarType,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(componentType: T, shape: 4): Vector4Type<T, R, V, VF>;

/**
 * Create a new vector type from the given type and shape.
 *
 * @param componentType The component type.
 * @param shape The vector shape.
 */
export function VectorOf<
  T extends MemoryType<R, V, VF> & AnyScalarType,
  N extends 2 | 3 | 4,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(componentType: T, shape: N): VectorType<T, N, R, V, VF>;

export function VectorOf(
  componentType: AnyScalarType,
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

/**
 * Create a new 2x2 matrix type of Float32 components.
 */
export function MatrixOf(
  componentType: Float32Type,
  shape: [2, 2],
): MatrixType<Float32Type, 2, 2>;

/**
 * Create a new 3x3 matrix type of Float32 components.
 */
export function MatrixOf(
  componentType: Float32Type,
  shape: [3, 3],
): MatrixType<Float32Type, 3, 3>;

/**
 * Create a new 4x4 matrix type of Float32 components.
 */
export function MatrixOf(
  componentType: Float32Type,
  shape: [4, 4],
): MatrixType<Float32Type, 4, 4>;

/**
 * Create a new 2x2 matrix type of Float16 components.
 */
export function MatrixOf(
  componentType: Float16Type,
  shape: [2, 2],
): MatrixType<Float16Type, 2, 2>;

/**
 * Create a new 3x3 matrix type of Float16 components.
 */
export function MatrixOf(
  componentType: Float16Type,
  shape: [3, 3],
): MatrixType<Float16Type, 3, 3>;

/**
 * Create a new 4x4 matrix type of Float16 components.
 */
export function MatrixOf(
  componentType: Float16Type,
  shape: [4, 4],
): MatrixType<Float16Type, 4, 4>;

/**
 * Create a new matrix type from the given type and shape.
 *
 * @param componentType The component type.
 * @param shape The matrix shape.
 */
export function MatrixOf<
  T extends MemoryType<R, V, VF> & AnyFloatingPointType,
  Cols extends 2 | 3 | 4,
  Rows extends 2 | 3 | 4,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(componentType: T, shape: [Cols, Rows]): MatrixType<T, Cols, Rows, R, V, VF>;

export function MatrixOf(
  componentType: AnyFloatingPointType,
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

/**
 * Create a new array type from the given type and length.
 *
 * @param type The element type.
 * @param length The element count. Must be greater than 0.
 */
export function ArrayOf<
  T extends MemoryType<R, V, VF>,
  N extends number,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF = MemoryTypeVF<T>,
>(type: T, length: Positive<N>): ArrayType<T, N, R, V, VF> {
  return new ArrayTypeImpl(type, length);
}

/**
 * Additional options for creating a struct type.
 */
interface StructOptions {
  /**
   * Whether to compile the struct type.
   *
   * This uses code generation to create a more efficient struct type.
   * Debugging may be easier with this option disabled.
   *
   * @default false
   */
  compile?: boolean;
}

/**
 * Create a new struct type from the given descriptor.
 *
 * @param descriptor The struct descriptor.
 * @param [options] Additional options.
 */
export function StructOf<S extends NonEmpty<StructDescriptor<S>>>(
  descriptor: S,
  options: StructOptions = {},
): StructType<S> {
  const { compile = false } = options;

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
