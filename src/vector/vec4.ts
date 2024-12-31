import {
  type AnyScalarType,
  GPU_SCALAR_TYPES,
  GPU_VEC4,
  type MemoryType,
  type MemoryTypeBoundedVF,
  type MemoryTypeR,
  type MemoryTypeV,
  type Vector4Type,
} from "../types.ts";

import { assertTypeOneOf } from "../internal/assert.ts";
import type { Tup4 } from "../internal/tuple.ts";
import { alignOfVec4, sizeOfVec4, strideOf } from "../internal/alignment.ts";

/**
 * A constructor for 4D vector types.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#vector-types
 */
export class Vec4<
  T extends MemoryType<R, V, VF> & AnyScalarType,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
> implements Vector4Type<T, R, V, VF> {
  #type: T;
  #byteSize: number;
  #alignment: number;
  #arrayStride: number;

  constructor(type: T) {
    assertTypeOneOf(type, GPU_SCALAR_TYPES);
    this.#type = type;
    this.#byteSize = sizeOfVec4(type.type);
    this.#alignment = alignOfVec4(type.type);
    this.#arrayStride = strideOf(this.#alignment, this.#byteSize);
  }

  /**
   * The shape of the vector.
   */
  get shape(): [4] {
    return [4];
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
    return `vec4<${String(this.#type)}>`;
  }
  /**
   * @inheritdoc
   */
  toCode(namespace: string): string {
    switch (this.#type.type) {
      case "f32":
        return `${namespace}.Vec4F`;
      case "f16":
        return `${namespace}.Vec4H`;
      case "i32":
        return `${namespace}.Vec4I`;
      case "u32":
        return `${namespace}.Vec4U`;
      case "bool":
        return `${namespace}.Vec4B`;
    }
  }

  /**
   * @inheritdoc
   */
  get type(): typeof GPU_VEC4 {
    return GPU_VEC4;
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
  read(view: DataView, offset: number = 0): Tup4<R> {
    return [
      this.getX(view, offset),
      this.getY(view, offset),
      this.getZ(view, offset),
      this.getW(view, offset),
    ];
  }

  /**
   * @inheritdoc
   */
  write(view: DataView, value: Tup4<R>, offset: number = 0) {
    this.setX(view, value[0], offset);
    this.setY(view, value[1], offset);
    this.setZ(view, value[2], offset);
    this.setW(view, value[3], offset);
  }

  /**
   * @inheritdoc
   */
  readAt(view: DataView, index: number, offset: number = 0): Tup4<R> {
    return this.read(view, index * this.arrayStride + offset);
  }

  /**
   * @inheritdoc
   */
  writeAt(view: DataView, index: number, value: Tup4<R>, offset: number = 0) {
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
    return this.#type.view(buffer, index * this.arrayStride + offset, 4);
  }

  get offsetX(): number {
    return 0;
  }

  get offsetY(): number {
    return this.#type.byteSize;
  }

  get offsetZ(): number {
    return this.#type.byteSize * 2;
  }

  get offsetW(): number {
    return this.#type.byteSize * 3;
  }

  getX(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetX);
  }

  getY(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetY);
  }

  getZ(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetZ);
  }

  getW(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetW);
  }

  setX(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetX);
  }

  setY(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetY);
  }

  setZ(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetZ);
  }

  setW(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetW);
  }

  get(view: DataView, indices: [0 | 1 | 2 | 3], offset: number = 0): R {
    return this.#type.read(view, offset + indices[0] * this.#type.byteSize);
  }

  set(view: DataView, indices: [0 | 1 | 2 | 3], value: R, offset: number = 0) {
    this.#type.write(view, value, offset + indices[0] * this.#type.byteSize);
  }

  offset(indices: [0 | 1 | 2 | 3]): number {
    return indices[0] * this.#type.byteSize;
  }
}
