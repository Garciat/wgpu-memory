import { GPU_U32, type Uint32Type } from "../types.ts";

export class Uint32TypeImpl implements Uint32Type {
  toString(): typeof GPU_U32 {
    return GPU_U32;
  }

  toCode(namespace: string): string {
    return `${namespace}.Uint32`;
  }

  get type(): typeof GPU_U32 {
    return GPU_U32;
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
    return view.getUint32(offset, true);
  }

  write(view: DataView, value: number, offset: number = 0) {
    view.setUint32(offset, value, true);
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
  ): Uint32Array {
    return new Uint32Array(buffer, offset, length);
  }

  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): Uint32Array {
    return new Uint32Array(buffer, index * this.arrayStride + offset, 1);
  }
}
