import {
  GPU_SCALAR_TYPES,
  GPU_VEC3,
  type IType,
  type ITypeBoundedVF,
  type ITypeR,
  type ITypeV,
} from "../types.ts";

import type { ScalarType } from "../scalar/mod.ts";

import { assertTypeOneOf } from "../internal/assert.ts";
import type { Tup3 } from "../internal/tuple.ts";
import { alignOfVec3, sizeOfVec3, strideOf } from "../internal/alignment.ts";

/**
 * A constructor for 3D vector types.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#vector-types
 */
export class Vec3<
  T extends IType<R, V, VF> & ScalarType,
  R = ITypeR<T>,
  V = ITypeV<T>,
  VF extends V = ITypeBoundedVF<T, V>,
> implements IType<Tup3<R>, V, VF> {
  #type: T;
  #byteSize: number;
  #alignment: number;
  #arrayStride: number;

  constructor(type: T) {
    assertTypeOneOf(type, GPU_SCALAR_TYPES);
    this.#type = type;
    this.#byteSize = sizeOfVec3(type.type);
    this.#alignment = alignOfVec3(type.type);
    this.#arrayStride = strideOf(this.#alignment, this.#byteSize);
  }

  /**
   * @inheritdoc
   */
  toString(): string {
    return `vec3<${String(this.#type)}>`;
  }

  /**
   * @inheritdoc
   */
  get type(): typeof GPU_VEC3 {
    return GPU_VEC3;
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
  read(view: DataView, offset: number = 0): Tup3<R> {
    return [
      this.getX(view, offset),
      this.getY(view, offset),
      this.getZ(view, offset),
    ];
  }

  /**
   * @inheritdoc
   */
  write(view: DataView, value: Tup3<R>, offset: number = 0) {
    this.setX(view, value[0], offset);
    this.setY(view, value[1], offset);
    this.setZ(view, value[2], offset);
  }

  /**
   * @inheritdoc
   */
  readAt(view: DataView, index: number, offset: number = 0): Tup3<R> {
    return this.read(view, index * this.arrayStride + offset);
  }

  /**
   * @inheritdoc
   */
  writeAt(view: DataView, index: number, value: Tup3<R>, offset: number = 0) {
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
    return this.#type.view(buffer, index * this.arrayStride + offset, 3);
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

  getX(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetX);
  }

  getY(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetY);
  }

  getZ(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetZ);
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
}
