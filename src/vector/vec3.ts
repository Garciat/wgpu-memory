import {
  GPU_SCALAR_TYPES,
  GPU_VEC3,
  type IType,
  type ITypeR,
  type ITypeV,
  type Tup3,
} from "../types.ts";

import { assertTypeOneOf, nextPowerOfTwo } from "../internal.ts";

import type { ScalarType } from "../scalar/mod.ts";

/**
 * A constructor for 3D vector types.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#vector-types
 */
export class Vec3<
  T extends IType<R, V> & ScalarType,
  R = ITypeR<T>,
  V = ITypeV<T>,
> implements IType<Tup3<R>, V> {
  #type: T;

  constructor(type: T) {
    assertTypeOneOf(type, GPU_SCALAR_TYPES);
    this.#type = type;
  }

  toString(): string {
    return `vec3<${String(this.#type)}>`;
  }

  get type(): typeof GPU_VEC3 {
    return GPU_VEC3;
  }

  get byteSize(): number {
    return this.#type.byteSize * 3;
  }

  get alignment(): number {
    return nextPowerOfTwo(this.#type.alignment * 3);
  }

  read(view: DataView, offset: number = 0): Tup3<R> {
    return [
      this.getX(view, offset),
      this.getY(view, offset),
      this.getZ(view, offset),
    ];
  }

  write(view: DataView, value: Tup3<R>, offset: number = 0) {
    this.setX(view, value[0], offset);
    this.setY(view, value[1], offset);
    this.setZ(view, value[2], offset);
  }

  readAt(view: DataView, index: number, offset: number = 0): Tup3<R> {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(view: DataView, index: number, value: Tup3<R>, offset: number = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): V {
    return this.#type.view(buffer, offset, length * 3);
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
