import { assertPositive } from "./internal/assert.ts";
import type { NonEmpty, Positive } from "./internal/constraints.ts";
import { ArrayTypeImpl } from "./array/array.ts";
import { StructTypeImpl } from "./struct/struct.ts";
import { compile as compileStruct } from "./struct/compile.ts";
import type { ScalarType } from "./scalar/mod.ts";
import { Vec2 } from "./vector/vec2.ts";
import { Vec3 } from "./vector/vec3.ts";
import { Vec4 } from "./vector/vec4.ts";
import type {
  ArrayType,
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

/**
 * @todo find a way to make this work without type casts
 */
export function VectorOf<
  T extends MemoryType<R, V, VF> & ScalarType,
  N extends 2 | 3 | 4,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(componentType: T, shape: N): VectorType<T, N, R, V, VF> {
  type Out = VectorType<T, N, R, V, VF>;
  switch (shape) {
    case 2:
      return new Vec2<T, R, V, VF>(componentType) as unknown as Out;
    case 3:
      return new Vec3<T, R, V, VF>(componentType) as unknown as Out;
    case 4:
      return new Vec4<T, R, V, VF>(componentType) as unknown as Out;
    default:
      shape satisfies never;
      throw Error(`Vector shape not supported: ${shape}`);
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
