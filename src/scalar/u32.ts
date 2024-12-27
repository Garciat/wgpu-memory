import { GPU_U32, type MemoryType } from "../types.ts";

/**
 * The 32-bit unsigned integer type.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#integer-types
 */
export class Uint32Type
  implements MemoryType<number, Uint32Array, Uint32Array> {
  /**
   * @inheritdoc
   */
  toString(): string {
    return "u32";
  }

  /**
   * @inheritdoc
   */
  get type(): typeof GPU_U32 {
    return GPU_U32;
  }

  /**
   * @inheritdoc
   */
  get byteSize(): 4 {
    return 4;
  }

  /**
   * @inheritdoc
   */
  get alignment(): 4 {
    return 4;
  }

  /**
   * @inheritdoc
   */
  get arrayStride(): 4 {
    return 4;
  }

  /**
   * @inheritdoc
   */
  read(view: DataView, offset: number = 0): number {
    return view.getUint32(offset, true);
  }

  /**
   * @inheritdoc
   */
  write(view: DataView, value: number, offset: number = 0) {
    view.setUint32(offset, value, true);
  }

  /**
   * @inheritdoc
   */
  readAt(view: DataView, index: number, offset: number = 0): number {
    return this.read(view, index * this.arrayStride + offset);
  }

  /**
   * @inheritdoc
   */
  writeAt(view: DataView, index: number, value: number, offset: number = 0) {
    this.write(view, value, index * this.arrayStride + offset);
  }

  /**
   * @inheritdoc
   */
  view(
    buffer: ArrayBuffer,
    offset: number = 0,
    length: number = 1,
  ): Uint32Array {
    return new Uint32Array(buffer, offset, length);
  }

  /**
   * @inheritdoc
   */
  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): Uint32Array {
    return new Uint32Array(buffer, index * this.arrayStride + offset, 1);
  }
}
