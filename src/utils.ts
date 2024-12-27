import type { MemoryType } from "./types.ts";
import { assertPositive } from "./internal/assert.ts";

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
