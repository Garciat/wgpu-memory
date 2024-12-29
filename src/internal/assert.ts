import type { GPUType, MemoryType } from "../types.ts";

export function assertTypeOneOf(
  type: MemoryType<unknown, unknown, unknown>,
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

export function invariant(condition: boolean, message: string) {
  if (!condition) {
    throw Error(message);
  }
}
