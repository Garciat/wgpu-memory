import type { IType } from "./types.ts";

/**
 * Allocate a new buffer for the given type.
 */
export function allocate(
  type: IType<unknown, unknown>,
  count: number = 1,
): ArrayBuffer {
  return new ArrayBuffer(type.byteSize * count);
}

/**
 * Count the number of elements that fit in the buffer.
 */
export function count(
  type: IType<unknown, unknown>,
  buffer: ArrayBufferLike | ArrayBufferView,
): number {
  return Math.floor(buffer.byteLength / type.byteSize);
}
