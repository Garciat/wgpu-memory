import { type Float32Type, GPU_F32 } from "../types.ts";

export class Float32TypeImpl implements Float32Type {
  toString(): typeof GPU_F32 {
    return GPU_F32;
  }

  toCode(namespace: string): string {
    return `${namespace}.Float32`;
  }

  get type(): typeof GPU_F32 {
    return GPU_F32;
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

  read(view: DataView, offset: number = 0): number {
    return view.getFloat32(offset, true);
  }

  write(view: DataView, value: number, offset: number = 0) {
    view.setFloat32(offset, value, true);
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
  ): Float32Array {
    return new Float32Array(buffer, offset, length);
  }

  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): Float32Array {
    return new Float32Array(buffer, index * this.arrayStride + offset, 1);
  }
}
