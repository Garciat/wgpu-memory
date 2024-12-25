import { GPU_I32, type IType } from "../types.ts";

export class Int32Type implements IType<number, Int32Array> {
  toString(): string {
    return "i32";
  }

  get type(): typeof GPU_I32 {
    return GPU_I32;
  }

  get byteSize(): number {
    return 4;
  }

  get alignment(): number {
    return 4;
  }

  read(view: DataView, offset: number = 0): number {
    return view.getInt32(offset, true);
  }

  write(view: DataView, value: number, offset: number = 0) {
    view.setInt32(offset, value, true);
  }

  readAt(view: DataView, index: number, offset: number = 0): number {
    return view.getInt32(index * this.byteSize + offset, true);
  }

  writeAt(view: DataView, index: number, value: number, offset: number = 0) {
    view.setInt32(index * this.byteSize + offset, value, true);
  }

  view(
    buffer: ArrayBuffer,
    offset: number = 0,
    length: number = 1,
  ): Int32Array {
    return new Int32Array(buffer, offset, length);
  }
}
