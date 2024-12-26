import type { GPUType, IType } from "../types.ts";

export function assertTypeOneOf(
  type: IType<unknown, unknown, unknown>,
  types: ReadonlySet<GPUType>,
) {
  if (!types.has(type.type)) {
    throw TypeError("Type must be one of " + Array.from(types));
  }
}

export function assertPositive(value: number) {
  if (value <= 0) {
    throw RangeError("Value must be positive");
  }
}
