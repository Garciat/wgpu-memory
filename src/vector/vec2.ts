import {
  GPU_SCALAR_TYPES,
  GPU_VEC2,
  type MemoryType,
  type MemoryTypeBoundedVF,
  type MemoryTypeR,
  type MemoryTypeV,
  type VectorType,
} from "../types.ts";

import type { ScalarType } from "../scalar/mod.ts";

import { assertTypeOneOf } from "../internal/assert.ts";
import type { Tup2 } from "../internal/tuple.ts";
import { alignOfVec2, sizeOfVec2, strideOf } from "../internal/alignment.ts";

/**
 * A constructor for 2D vector types.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#vector-types
 */
export class Vec2<
  T extends MemoryType<R, V, VF> & ScalarType,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
> implements VectorType<T, 2, R, V, VF> {
  #type: T;
  #byteSize: number;
  #alignment: number;
  #arrayStride: number;

  constructor(type: T) {
    assertTypeOneOf(type, GPU_SCALAR_TYPES);
    this.#type = type;
    this.#byteSize = sizeOfVec2(type.type);
    this.#alignment = alignOfVec2(type.type);
    this.#arrayStride = strideOf(this.#alignment, this.#byteSize);
  }

  /**
   * The shape of the vector.
   */
  get shape(): [2] {
    return [2];
  }

  /**
   * The component type of the vector.
   */
  get componentType(): T {
    return this.#type;
  }

  /**
   * @inheritdoc
   */
  toString(): string {
    return `vec2<${String(this.#type)}>`;
  }

  /**
   * @inheritdoc
   */
  toCode(namespace: string): string {
    switch (this.#type.type) {
      case "f32":
        return `${namespace}.Vec2F`;
      case "f16":
        return `${namespace}.Vec2H`;
      case "i32":
        return `${namespace}.Vec2I`;
      case "u32":
        return `${namespace}.Vec2U`;
      case "bool":
        return `${namespace}.Vec2B`;
    }
  }

  /**
   * @inheritdoc
   */
  get type(): typeof GPU_VEC2 {
    return GPU_VEC2;
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
  read(view: DataView, offset: number = 0): Tup2<R> {
    return [
      this.getX(view, offset),
      this.getY(view, offset),
    ];
  }

  /**
   * @inheritdoc
   */
  write(view: DataView, value: Tup2<R>, offset: number = 0) {
    this.setX(view, value[0], offset);
    this.setY(view, value[1], offset);
  }

  /**
   * @inheritdoc
   */
  readAt(view: DataView, index: number, offset: number = 0): Tup2<R> {
    return this.read(view, index * this.arrayStride + offset);
  }

  /**
   * @inheritdoc
   */
  writeAt(view: DataView, index: number, value: Tup2<R>, offset: number = 0) {
    this.write(view, value, index * this.arrayStride + offset);
  }

  /**
   * @inheritdoc
   */
  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): VF {
    return this.#type.view(
      buffer,
      offset,
      length * this.arrayStride / this.#type.byteSize,
    );
  }

  /**
   * @inheritdoc
   */
  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): V {
    return this.#type.view(buffer, index * this.arrayStride + offset, 2);
  }

  get offsetX(): number {
    return 0;
  }

  get offsetY(): number {
    return this.#type.byteSize;
  }

  getX(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetX);
  }

  getY(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetY);
  }

  setX(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetX);
  }

  setY(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetY);
  }

  get(view: DataView, indices: [0 | 1], offset: number = 0): R {
    return this.#type.read(view, offset + indices[0] * this.#type.byteSize);
  }

  set(view: DataView, indices: [0 | 1], value: R, offset: number = 0) {
    this.#type.write(view, value, offset + indices[0] * this.#type.byteSize);
  }

  offset(indices: [0 | 1]): number {
    return indices[0] * this.#type.byteSize;
  }
}
