import { type BoolType, GPU_BOOL } from "../types.ts";

export class BoolTypeImpl implements BoolType {
  toString(): typeof GPU_BOOL {
    return GPU_BOOL;
  }

  toCode(namespace: string): string {
    return `${namespace}.Bool`;
  }

  get type(): typeof GPU_BOOL {
    return GPU_BOOL;
  }

  get byteSize(): 4 {
    return 4;
  }

  get alignment(): 4 {
    return 4;
  }

  get arrayStride(): 4 {
    return 4;
  }

  read(view: DataView, offset: number = 0): boolean {
    return !!view.getInt32(offset, true);
  }

  write(view: DataView, value: boolean, offset: number = 0) {
    view.setInt32(offset, value ? 1 : 0, true);
  }

  readAt(view: DataView, index: number, offset: number = 0): boolean {
    return this.read(view, index * this.arrayStride + offset);
  }

  writeAt(view: DataView, index: number, value: boolean, offset: number = 0) {
    this.write(view, value, index * this.arrayStride + offset);
  }

  view(
    buffer: ArrayBuffer,
    offset: number = 0,
    length: number = 1,
  ): Uint32Array {
    return new Uint32Array(buffer, offset, length);
  }

  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): Uint32Array {
    return new Uint32Array(buffer, index * this.arrayStride + offset, 1);
  }
}
