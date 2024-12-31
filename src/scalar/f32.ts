import { type Float32Type, GPU_F32 } from "../types.ts";

/**
 * The 32-bit floating-point type.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#floating-point-types
 */
export class Float32TypeImpl implements Float32Type {
  /**
   * @inheritdoc
   */
  toString(): typeof GPU_F32 {
    return GPU_F32;
  }

  /**
   * @inheritdoc
   */
  toCode(namespace: string): string {
    return `${namespace}.Float32`;
  }

  /**
   * @inheritdoc
   */
  get type(): typeof GPU_F32 {
    return GPU_F32;
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
    return view.getFloat32(offset, true);
  }

  /**
   * @inheritdoc
   */
  write(view: DataView, value: number, offset: number = 0) {
    view.setFloat32(offset, value, true);
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
  ): Float32Array {
    return new Float32Array(buffer, offset, length);
  }

  /**
   * @inheritdoc
   */
  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): Float32Array {
    return new Float32Array(buffer, index * this.arrayStride + offset, 1);
  }
}
