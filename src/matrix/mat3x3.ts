import {
  GPU_FLOATING_POINT_TYPES,
  GPU_MAT3X3,
  type IType,
  type ITypeR,
  type ITypeV,
} from "../types.ts";

import type { FloatingPointType } from "../scalar/mod.ts";

import { assertTypeOneOf } from "../internal/assert.ts";

import type { Tup3 } from "../internal/tuple.ts";

/**
 * A 3x3 matrix type. The components are stored in column-major order per WGSL.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#matrix-types
 */
export class Mat3x3<
  T extends IType<R, V> & FloatingPointType,
  R = ITypeR<T>,
  V = ITypeV<T>,
> implements IType<Tup3<Tup3<R>>, V> {
  #type: T;

  constructor(type: T) {
    assertTypeOneOf(type, GPU_FLOATING_POINT_TYPES);
    this.#type = type;
  }

  toString(): string {
    return `mat3x3<${String(this.#type)}>`;
  }

  get type(): typeof GPU_MAT3X3 {
    return GPU_MAT3X3;
  }

  get byteSize(): number {
    return this.#type.byteSize * 12;
  }

  get alignment(): number {
    return this.#type.alignment * 4;
  }

  read(view: DataView, offset: number = 0): Tup3<Tup3<R>> {
    return [
      [
        this.get(view, 0, 0, offset),
        this.get(view, 0, 1, offset),
        this.get(view, 0, 2, offset),
      ],
      [
        this.get(view, 1, 0, offset),
        this.get(view, 1, 1, offset),
        this.get(view, 1, 2, offset),
      ],
      [
        this.get(view, 2, 0, offset),
        this.get(view, 2, 1, offset),
        this.get(view, 2, 2, offset),
      ],
    ];
  }

  write(view: DataView, value: Tup3<Tup3<R>>, offset: number = 0) {
    this.set(view, 0, 0, value[0][0], offset);
    this.set(view, 0, 1, value[0][1], offset);
    this.set(view, 0, 2, value[0][2], offset);
    this.set(view, 1, 0, value[1][0], offset);
    this.set(view, 1, 1, value[1][1], offset);
    this.set(view, 1, 2, value[1][2], offset);
    this.set(view, 2, 0, value[2][0], offset);
    this.set(view, 2, 1, value[2][1], offset);
    this.set(view, 2, 2, value[2][2], offset);
  }

  readAt(view: DataView, index: number, offset: number = 0): Tup3<Tup3<R>> {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(
    view: DataView,
    index: number,
    value: Tup3<Tup3<R>>,
    offset: number = 0,
  ) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): V {
    return this.#type.view(buffer, offset, length * 9);
  }

  get(view: DataView, column: number, row: number, offset: number = 0): R {
    return this.#type.read(view, offset + this.#offset(column, row));
  }

  set(
    view: DataView,
    column: number,
    row: number,
    value: R,
    offset: number = 0,
  ) {
    this.#type.write(view, value, offset + this.#offset(column, row));
  }

  #index(column: number, row: number): number {
    return column * 3 + row;
  }

  #offset(column: number, row: number): number {
    return this.#index(column, row) * this.#type.byteSize;
  }
}
