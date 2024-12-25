import { GPU_ARRAY, type IType, type ITypeR, type ITypeV } from "../types.ts";
import { assertPositive, wgslRoundUp } from "../internal.ts";

/**
 * Generic constraint for positive number constants.
 */
type Positive<N extends number> = `${N}` extends `-${infer NP}` ? never
  : N extends 0 ? never
  : N;

/**
 * A constructor for fixed-size array types.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#array-types
 */
export class ArrayType<
  T extends IType<R, V>,
  N extends number,
  R = ITypeR<T>,
  V = ITypeV<T>,
> implements IType<R[], V> {
  #type: T;
  #length: N;

  constructor(type: T, length: Positive<N>) {
    assertPositive(length);
    this.#type = type;
    this.#length = length;
  }

  toString(): string {
    return `array<${String(this.#type)}, ${this.#length}>`;
  }

  get type(): typeof GPU_ARRAY {
    return GPU_ARRAY;
  }

  get byteSize(): number {
    return this.#length *
      wgslRoundUp(this.#type.alignment, this.#type.byteSize);
  }

  get alignment(): number {
    return this.#type.alignment;
  }

  read(view: DataView, offset: number = 0): R[] {
    const values = Array(this.#length);

    for (let i = 0; i < this.#length; i++) {
      values[i] = this.get(view, i, offset);
    }

    return values;
  }

  write(view: DataView, values: R[], offset: number = 0) {
    for (let i = 0; i < this.#length; i++) {
      this.set(view, i, values[i], offset);
    }
  }

  readAt(view: DataView, index: number, offset: number = 0): R[] {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(view: DataView, index: number, value: R[], offset: number = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): V {
    return this.#type.view(buffer, offset, length * this.#length);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {R}
   */
  get(view: DataView, index: number, offset: number = 0): R {
    return this.#type.readAt(view, index, offset);
  }

  set(view: DataView, index: number, value: R, offset: number = 0) {
    this.#type.writeAt(view, index, value, offset);
  }
}
