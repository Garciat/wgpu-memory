import {
  GPU_ARRAY,
  type IType,
  type ITypeR,
  type ITypeV,
  type ITypeVF,
} from "../types.ts";
import type { Positive } from "../internal/constraints.ts";
import { assertPositive } from "../internal/assert.ts";
import { makeEmptyTupN, setTupN, type TupN } from "../internal/tuple.ts";
import {
  alignOfArrayN,
  sizeOfArrayN,
  strideOf,
} from "../internal/alignment.ts";

/**
 * A constructor for fixed-size array types.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#array-types
 */
export class ArrayType<
  T extends IType<R, V, VF>,
  N extends number,
  R = ITypeR<T>,
  V = ITypeV<T>,
  VF = ITypeVF<T>,
> implements IType<TupN<R, N>, TupN<V, N>, VF> {
  #type: T;
  #length: N;
  #byteSize: number;
  #alignment: number;
  #arrayStride: number;

  constructor(type: T, length: Positive<N>) {
    assertPositive(length);
    this.#type = type;
    this.#length = length;
    this.#byteSize = sizeOfArrayN(length, type.alignment, type.byteSize);
    this.#alignment = alignOfArrayN(type.alignment);
    this.#arrayStride = strideOf(this.#alignment, this.#byteSize);
  }

  /**
   * @inheritdoc
   */
  toString(): string {
    return `array<${String(this.#type)}, ${this.#length}>`;
  }

  /**
   * @inheritdoc
   */
  get type(): typeof GPU_ARRAY {
    return GPU_ARRAY;
  }

  /**
   * @inheritdoc
   */
  get byteSize(): number {
    return this.#byteSize;
  }

  /**
   * @inheritdoc
   */
  get alignment(): number {
    return this.#alignment;
  }

  /**
   * @inheritdoc
   */
  get arrayStride(): number {
    return this.#arrayStride;
  }

  /**
   * @inheritdoc
   */
  read(view: DataView, offset: number = 0): TupN<R, N> {
    const values = makeEmptyTupN<R, N>(this.#length);

    for (let i = 0; i < this.#length; i++) {
      setTupN(values, i, this.get(view, i, offset));
    }

    return values;
  }

  /**
   * @inheritdoc
   */
  write(view: DataView, values: TupN<R, N>, offset: number = 0) {
    for (let i = 0; i < this.#length; i++) {
      this.set(view, i, values[i], offset);
    }
  }

  /**
   * @inheritdoc
   */
  readAt(view: DataView, index: number, offset: number = 0): TupN<R, N> {
    return this.read(view, index * this.arrayStride + offset);
  }

  /**
   * @inheritdoc
   */
  writeAt(
    view: DataView,
    index: number,
    value: TupN<R, N>,
    offset: number = 0,
  ) {
    this.write(view, value, index * this.arrayStride + offset);
  }

  /**
   * @inheritdoc
   */
  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): VF {
    return this.#type.view(buffer, offset, length * this.#length);
  }

  /**
   * @inheritdoc
   */
  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): TupN<V, N> {
    const views = makeEmptyTupN<V, N>(this.#length);

    for (let i = 0; i < this.#length; i++) {
      setTupN(
        views,
        i,
        this.#type.viewAt(
          buffer,
          i,
          index * this.arrayStride + offset,
        ),
      );
    }

    return views;
  }

  get(view: DataView, index: number, offset: number = 0): R {
    return this.#type.readAt(view, index, offset);
  }

  set(view: DataView, index: number, value: R, offset: number = 0) {
    this.#type.writeAt(view, index, value, offset);
  }
}
