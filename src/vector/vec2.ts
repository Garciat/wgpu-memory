import {
  GPU_SCALAR_TYPES,
  GPU_VEC2,
  type IType,
  type ITypeR,
  type ITypeV,
  type Tup2,
} from "../types.ts";

import { assertTypeOneOf } from "../internal.ts";

import type { ScalarType } from "../scalar/mod.ts";

export class Vec2<
  T extends IType<R, V> & ScalarType,
  R = ITypeR<T>,
  V = ITypeV<T>,
> implements IType<Tup2<R>, V> {
  #type: T;

  constructor(type: T) {
    assertTypeOneOf(type, GPU_SCALAR_TYPES);
    this.#type = type;
  }

  toString(): string {
    return `vec2<${String(this.#type)}>`;
  }

  get type(): typeof GPU_VEC2 {
    return GPU_VEC2;
  }

  get byteSize(): number {
    return this.#type.byteSize * 2;
  }

  get alignment(): number {
    return this.#type.alignment * 2;
  }
  read(view: DataView, offset: number = 0): Tup2<R> {
    return [
      this.getX(view, offset),
      this.getY(view, offset),
    ];
  }

  write(view: DataView, value: Tup2<R>, offset: number = 0) {
    this.setX(view, value[0], offset);
    this.setY(view, value[1], offset);
  }

  readAt(view: DataView, index: number, offset: number = 0): Tup2<R> {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(view: DataView, index: number, value: Tup2<R>, offset: number = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): V {
    return this.#type.view(buffer, offset, length * 2);
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
}
