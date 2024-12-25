import { GPU_BOOL, type IType } from "../types.ts";

/**
 * The boolean type.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#bool-type
 */
export class BoolType implements IType<boolean, Uint32Array> {
  toString(): string {
    return "bool";
  }

  get type(): typeof GPU_BOOL {
    return GPU_BOOL;
  }

  /**
   * @see https://gpuweb.github.io/gpuweb/wgsl/#why-is-bool-4-bytes
   */
  get byteSize(): number {
    return 4;
  }

  /**
   * @see https://gpuweb.github.io/gpuweb/wgsl/#why-is-bool-4-bytes
   */
  get alignment(): number {
    return 4;
  }

  read(view: DataView, offset: number = 0): boolean {
    return !!view.getInt32(offset, true);
  }

  write(view: DataView, value: boolean, offset: number = 0) {
    view.setInt32(offset, value ? 1 : 0, true);
  }

  readAt(view: DataView, index: number, offset: number = 0): boolean {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(view: DataView, index: number, value: boolean, offset: number = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(
    buffer: ArrayBuffer,
    offset: number = 0,
    length: number = 1,
  ): Uint32Array {
    return new Uint32Array(buffer, offset, length);
  }
}
