import { GPU_U32, type IType } from "../types.ts";

export class Uint32Type implements IType<number, Uint32Array> {
  toString(): string {
    return "u32";
  }

  get type(): typeof GPU_U32 {
    return GPU_U32;
  }

  get byteSize(): number {
    return 4;
  }

  get alignment(): number {
    return 4;
  }

  read(view: DataView, offset: number = 0): number {
    return view.getUint32(offset, true);
  }

  write(view: DataView, value: number, offset: number = 0) {
    view.setUint32(offset, value, true);
  }

  readAt(view: DataView, index: number, offset: number = 0): number {
    return view.getUint32(index * this.byteSize + offset, true);
  }

  writeAt(view: DataView, index: number, value: number, offset: number = 0) {
    view.setUint32(index * this.byteSize + offset, value, true);
  }

  view(
    buffer: ArrayBuffer,
    offset: number = 0,
    length: number = 1,
  ): Uint32Array {
    return new Uint32Array(buffer, offset, length);
  }
}
