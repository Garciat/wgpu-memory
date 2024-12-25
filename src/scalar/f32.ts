import { GPU_F32, type IType } from "../types.ts";

/**
 * The 32-bit floating-point type.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#floating-point-types
 */
export class Float32Type implements IType<number, Float32Array> {
  toString(): string {
    return "f32";
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

  read(view: DataView, offset: number = 0): number {
    return view.getFloat32(offset, true);
  }

  write(view: DataView, value: number, offset: number = 0) {
    view.setFloat32(offset, value, true);
  }

  readAt(view: DataView, index: number, offset: number = 0): number {
    return view.getFloat32(index * this.byteSize + offset, true);
  }

  writeAt(view: DataView, index: number, value: number, offset: number = 0) {
    view.setFloat32(index * this.byteSize + offset, value, true);
  }

  view(
    buffer: ArrayBuffer,
    offset: number = 0,
    length: number = 1,
  ): Float32Array {
    return new Float32Array(buffer, offset, length);
  }
}