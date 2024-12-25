import { GPU_F16, type IType } from "../types.ts";

/**
 * The 16-bit floating-point type.
 *
 * @experimental Float16 is not yet standard.
 * @see https://github.com/tc39/proposal-float16array
 * @see https://gpuweb.github.io/gpuweb/wgsl/#floating-point-types
 */
export class Float16Type implements IType<number, Float16Array> {
  toString(): string {
    return "f16";
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

  read(view: DataView, offset: number = 0): number {
    return view.getFloat16(offset, true);
  }

  write(view: DataView, value: number, offset: number = 0): void {
    return view.setFloat16(offset, value, true);
  }

  readAt(view: DataView, index: number, offset: number = 0): number {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(view: DataView, index: number, value: number, offset: number = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(
    buffer: ArrayBuffer,
    offset: number = 0,
    length: number = 1,
  ): Float16Array {
    return new Float16Array(buffer, offset, length);
  }
}
