import type { IType } from "./types.ts";

export function allocate(
  type: IType<unknown, unknown>,
  count: number = 1,
): ArrayBuffer {
  return new ArrayBuffer(type.byteSize * count);
}

export function count(
  type: IType<unknown, unknown>,
  buffer: ArrayBufferLike | ArrayBufferView,
): number {
  return Math.floor(buffer.byteLength / type.byteSize);
}
