import {
  GPU_FLOATING_POINT_TYPES,
  GPU_MAT2X2,
  type IType,
  type ITypeR,
  type ITypeV,
  type Tup2,
} from "../types.ts";

import { assertTypeOneOf } from "../internal.ts";

import type { FloatingPointType } from "../scalar/mod.ts";

export class Mat2x2<
  T extends IType<R, V> & FloatingPointType,
  R = ITypeR<T>,
  V = ITypeV<T>,
> implements IType<Tup2<Tup2<R>>, V> {
  #type: T;

  constructor(type: T) {
    assertTypeOneOf(type, GPU_FLOATING_POINT_TYPES);
    this.#type = type;
  }

  toString(): string {
    return `mat2x2<${String(this.#type)}>`;
  }

  get type(): typeof GPU_MAT2X2 {
    return GPU_MAT2X2;
  }

  get byteSize(): number {
    return this.#type.byteSize * 4;
  }

  get alignment(): number {
    return this.#type.alignment * 2;
  }

  read(view: DataView, offset: number = 0): Tup2<Tup2<R>> {
    return [
      [
        this.get(view, 0, 0, offset),
        this.get(view, 0, 1, offset),
      ],
      [
        this.get(view, 1, 0, offset),
        this.get(view, 1, 1, offset),
      ],
    ];
  }

  write(view: DataView, value: Tup2<Tup2<R>>, offset: number = 0) {
    this.set(view, 0, 0, value[0][0], offset);
    this.set(view, 0, 1, value[0][1], offset);
    this.set(view, 1, 0, value[1][0], offset);
    this.set(view, 1, 1, value[1][1], offset);
  }

  readAt(view: DataView, index: number, offset: number = 0): Tup2<Tup2<R>> {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(
    view: DataView,
    index: number,
    value: Tup2<Tup2<R>>,
    offset: number = 0,
  ) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): V {
    return this.#type.view(buffer, offset, length * 4);
  }

  get(view: DataView, row: number, column: number, offset: number = 0): R {
    return this.#type.read(view, offset + this.#offset(row, column));
  }

  set(
    view: DataView,
    row: number,
    column: number,
    value: R,
    offset: number = 0,
  ) {
    this.#type.write(view, value, offset + this.#offset(row, column));
  }

  #index(row: number, column: number): number {
    return row * 2 + column;
  }

  #offset(row: number, column: number): number {
    return this.#index(row, column) * this.#type.byteSize;
  }
}
