import {
  GPU_BOOL,
  GPU_F16,
  GPU_F32,
  GPU_I32,
  GPU_U32,
  type GPUFloatingPointType,
  type GPUScalarType,
} from "../types.ts";
import { wgslRoundUp } from "./math.ts";

// Source: https://gpuweb.github.io/gpuweb/wgsl/#alignment-and-size

export function alignOfArrayN(alignOfElement: number): number {
  return alignOfElement;
}

export function sizeOfArrayN(
  elementCount: number,
  alignOfElement: number,
  sizeOfElement: number,
): number {
  return elementCount * wgslRoundUp(alignOfElement, sizeOfElement);
}

/**
 * @see https://gpuweb.github.io/gpuweb/wgsl/#strideof
 */
export function strideOf(
  alignOfElement: number,
  sizeOfElement: number,
): number {
  return wgslRoundUp(alignOfElement, sizeOfElement);
}

export function alignOfVec2(componentType: GPUScalarType): number {
  switch (componentType) {
    case GPU_F16:
      return 4;
    case GPU_F32:
    case GPU_I32:
    case GPU_U32:
    case GPU_BOOL:
      return 8;
    default:
      throw new TypeError(
        `Unsupported component type ${componentType satisfies never}`,
      );
  }
}

export function sizeOfVec2(componentType: GPUScalarType): number {
  switch (componentType) {
    case GPU_F16:
      return 4;
    case GPU_F32:
    case GPU_I32:
    case GPU_U32:
    case GPU_BOOL:
      return 8;
    default:
      throw new TypeError(
        `Unsupported component type ${componentType satisfies never}`,
      );
  }
}

export function alignOfVec3(componentType: GPUScalarType): number {
  switch (componentType) {
    case GPU_F16:
      return 8;
    case GPU_F32:
    case GPU_I32:
    case GPU_U32:
    case GPU_BOOL:
      return 16;
    default:
      throw new TypeError(
        `Unsupported component type ${componentType satisfies never}`,
      );
  }
}

export function sizeOfVec3(componentType: GPUScalarType): number {
  switch (componentType) {
    case GPU_F16:
      return 6;
    case GPU_F32:
    case GPU_I32:
    case GPU_U32:
    case GPU_BOOL:
      return 12;
    default:
      throw new TypeError(
        `Unsupported component type ${componentType satisfies never}`,
      );
  }
}

export function alignOfVec4(componentType: GPUScalarType): number {
  switch (componentType) {
    case GPU_F16:
      return 8;
    case GPU_F32:
    case GPU_I32:
    case GPU_U32:
    case GPU_BOOL:
      return 16;
    default:
      throw new TypeError(
        `Unsupported component type ${componentType satisfies never}`,
      );
  }
}

export function sizeOfVec4(componentType: GPUScalarType): number {
  switch (componentType) {
    case GPU_F16:
      return 8;
    case GPU_F32:
    case GPU_I32:
    case GPU_U32:
    case GPU_BOOL:
      return 16;
    default:
      throw new TypeError(
        `Unsupported component type ${componentType satisfies never}`,
      );
  }
}

export function alignOfVecN(
  size: 2 | 3 | 4,
  componentType: GPUScalarType,
): number {
  switch (size) {
    case 2:
      return alignOfVec2(componentType);
    case 3:
      return alignOfVec3(componentType);
    case 4:
      return alignOfVec4(componentType);
    default:
      throw new RangeError(`Unsupported vector size ${size satisfies never}`);
  }
}

export function sizeOfVecN(
  size: 2 | 3 | 4,
  componentType: GPUScalarType,
): number {
  switch (size) {
    case 2:
      return sizeOfVec2(componentType);
    case 3:
      return sizeOfVec3(componentType);
    case 4:
      return sizeOfVec4(componentType);
    default:
      throw new RangeError(`Unsupported vector size ${size satisfies never}`);
  }
}

export function alignOfMatCxR(
  _ncols: 2 | 3 | 4,
  nrows: 2 | 3 | 4,
  componentType: GPUFloatingPointType,
): number {
  return alignOfVecN(nrows, componentType);
}

export function sizeOfMatCxR(
  ncols: 2 | 3 | 4,
  nrows: 2 | 3 | 4,
  componentType: GPUFloatingPointType,
): number {
  return sizeOfArrayN(
    ncols,
    alignOfVecN(nrows, componentType),
    sizeOfVecN(nrows, componentType),
  );
}
