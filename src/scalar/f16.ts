import { type Float16Type, GPU_F16 } from "../types.ts";

/**
 * The 16-bit floating-point type.
 *
 * @experimental Float16 is not yet standard.
 * @see https://github.com/tc39/proposal-float16array
 * @see https://gpuweb.github.io/gpuweb/wgsl/#floating-point-types
 */
export class Float16TypeImpl implements Float16Type {
  /**
   * @inheritdoc
   */
  toString(): typeof GPU_F16 {
    return GPU_F16;
  }

  /**
   * @inheritdoc
   */
  toCode(namespace: string): string {
    return `${namespace}.Float16`;
  }

  /**
   * @inheritdoc
   */
  get type(): typeof GPU_F16 {
    return GPU_F16;
  }

  /**
   * @inheritdoc
   */
  get byteSize(): 2 {
    return 2;
  }

  /**
   * @inheritdoc
   */
  get alignment(): 2 {
    return 2;
  }

  /**
   * @inheritdoc
   */
  get arrayStride(): 2 {
    return 2;
  }

  /**
   * @inheritdoc
   */
  read(view: DataView, offset: number = 0): number {
    return view.getFloat16(offset, true);
  }

  /**
   * @inheritdoc
   */
  write(view: DataView, value: number, offset: number = 0): void {
    return view.setFloat16(offset, value, true);
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
  ): Float16Array {
    return new Float16Array(buffer, offset, length);
  }

  /**
   * @inheritdoc
   */
  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): Float16Array {
    return new Float16Array(buffer, index * this.arrayStride + offset, 1);
  }
}
