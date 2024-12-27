import { GPU_BOOL, type MemoryType } from "../types.ts";

/**
 * The boolean type.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#bool-type
 */
export class BoolType implements MemoryType<boolean, Uint32Array, Uint32Array> {
  /**
   * @inheritdoc
   */
  toString(): string {
    return "bool";
  }

  /**
   * @inheritdoc
   */
  toCode(namespace: string): string {
    return `${namespace}.Bool`;
  }

  /**
   * @inheritdoc
   */
  get type(): typeof GPU_BOOL {
    return GPU_BOOL;
  }

  /**
   * @inheritdoc
   * @see https://gpuweb.github.io/gpuweb/wgsl/#why-is-bool-4-bytes
   */
  get byteSize(): 4 {
    return 4;
  }

  /**
   * @inheritdoc
   * @see https://gpuweb.github.io/gpuweb/wgsl/#why-is-bool-4-bytes
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
  read(view: DataView, offset: number = 0): boolean {
    return !!view.getInt32(offset, true);
  }

  /**
   * @inheritdoc
   */
  write(view: DataView, value: boolean, offset: number = 0) {
    view.setInt32(offset, value ? 1 : 0, true);
  }

  /**
   * @inheritdoc
   */
  readAt(view: DataView, index: number, offset: number = 0): boolean {
    return this.read(view, index * this.arrayStride + offset);
  }

  /**
   * @inheritdoc
   */
  writeAt(view: DataView, index: number, value: boolean, offset: number = 0) {
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
