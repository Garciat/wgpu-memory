import {
  type AnyScalarType,
  GPU_SCALAR_TYPES,
  GPU_VEC2,
  type MemoryType,
  type MemoryTypeBoundedVF,
  type MemoryTypeR,
  type MemoryTypeV,
  type Vector2Type,
} from "../types.ts";

import { assertTypeOneOf } from "../internal/assert.ts";
import type { Tup2 } from "../internal/tuple.ts";
import { alignOfVec2, sizeOfVec2, strideOf } from "../internal/alignment.ts";
import { vectorToCode, vectorToString } from "./common.ts";

export class Vec2<
  T extends MemoryType<R, V, VF> & AnyScalarType,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
> implements Vector2Type<T, R, V, VF> {
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

  get shape(): [2] {
    return [2];
  }

  get componentType(): T {
    return this.#type;
  }

  toString(): string {
    return vectorToString(this);
  }

  toCode(namespace: string): string {
    return vectorToCode(this, namespace);
  }

  get type(): typeof GPU_VEC2 {
    return GPU_VEC2;
  }

  get byteSize(): number {
    return this.#byteSize;
  }

  get alignment(): number {
    return this.#alignment;
  }

  get arrayStride(): number {
    return this.#arrayStride;
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
    return this.read(view, index * this.arrayStride + offset);
  }

  writeAt(view: DataView, index: number, value: Tup2<R>, offset: number = 0) {
    this.write(view, value, index * this.arrayStride + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): VF {
    return this.#type.view(
      buffer,
      offset,
      length * this.arrayStride / this.#type.byteSize,
    );
  }

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
