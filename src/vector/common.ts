import type {
  AnyScalarType,
  MemoryType,
  MemoryTypeBoundedVF,
  MemoryTypeR,
  MemoryTypeV,
  VectorType,
} from "../types.ts";

export function vectorToString<
  T extends MemoryType<R, V, VF> & AnyScalarType,
  N extends 2 | 3 | 4,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(
  vector: VectorType<T, N, R, V, VF>,
): string {
  return `vec${vector.shape[0]}<${String(vector.componentType)}>`;
}

export function vectorToCode<
  T extends MemoryType<R, V, VF> & AnyScalarType,
  N extends 2 | 3 | 4,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(
  vector: VectorType<T, N, R, V, VF>,
  namespace: string,
): string {
  switch (vector.componentType.type) {
    case "f32":
      return `${namespace}.Vec${vector.shape[0]}F`;
    case "f16":
      return `${namespace}.Vec${vector.shape[0]}H`;
    case "i32":
      return `${namespace}.Vec${vector.shape[0]}I`;
    case "u32":
      return `${namespace}.Vec${vector.shape[0]}U`;
    case "bool":
      return `${namespace}.Vec${vector.shape[0]}B`;
  }
}
