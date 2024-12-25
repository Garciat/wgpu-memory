import type { GPUType, IType } from "./types.ts";

export function nextPowerOfTwo(value: number): number {
  return 2 ** Math.ceil(Math.log2(value));
}

/**
 * @see https://gpuweb.github.io/gpuweb/wgsl/#roundup
 */
export function wgslRoundUp(k: number, n: number): number {
  return Math.ceil(n / k) * k;
}

export function typedObjectKeys<T extends Record<string, unknown>>(
  obj: T,
): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

export function assertTypeOneOf(
  type: IType<unknown, unknown>,
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
