import type { FloatingPointType } from "../scalar/mod.ts";
import type { MatrixType } from "../types.ts";

export function matrixToString<
  NCol extends 2 | 3 | 4,
  NRow extends 2 | 3 | 4,
>(matrix: MatrixType<FloatingPointType, NCol, NRow>): string {
  return `mat${matrix.shape[0]}x${matrix.shape[1]}<${
    String(matrix.componentType)
  }>`;
}

export function matrixToCode<
  NCol extends 2 | 3 | 4,
  NRow extends 2 | 3 | 4,
>(
  matrix: MatrixType<FloatingPointType, NCol, NRow>,
  namespace: string,
): string {
  switch (matrix.componentType.type) {
    case "f32":
      return `${namespace}.Mat${matrix.shape[0]}x${matrix.shape[1]}F`;
    case "f16":
      return `${namespace}.Mat${matrix.shape[0]}x${matrix.shape[1]}H`;
  }
}
