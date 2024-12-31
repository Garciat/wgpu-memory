import { type Float16Type, GPU_F16 } from "../types.ts";

export class Float16TypeImpl implements Float16Type {
  toString(): typeof GPU_F16 {
    return GPU_F16;
  }

  toCode(namespace: string): string {
    return `${namespace}.Float16`;
  }

  get type(): typeof GPU_F16 {
    return GPU_F16;
  }

  get byteSize(): 2 {
    return 2;
  }

  get alignment(): 2 {
    return 2;
  }

  get arrayStride(): 2 {
    return 2;
  }

  read(view: DataView, offset: number = 0): number {
    return view.getFloat16(offset, true);
  }

  write(view: DataView, value: number, offset: number = 0): void {
    return view.setFloat16(offset, value, true);
  }

  readAt(view: DataView, index: number, offset: number = 0): number {
    return this.read(view, index * this.arrayStride + offset);
  }

  writeAt(view: DataView, index: number, value: number, offset: number = 0) {
    this.write(view, value, index * this.arrayStride + offset);
  }

  view(
    buffer: ArrayBuffer,
    offset: number = 0,
    length: number = 1,
  ): Float16Array {
    return new Float16Array(buffer, offset, length);
  }

  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): Float16Array {
    return new Float16Array(buffer, index * this.arrayStride + offset, 1);
  }
}
