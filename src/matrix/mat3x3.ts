import {
  GPU_FLOATING_POINT_TYPES,
  GPU_MAT3X3,
  type IType,
  type ITypeR,
  type ITypeV,
} from "../types.ts";

import type { FloatingPointType } from "../scalar/mod.ts";

import { assertTypeOneOf } from "../internal/assert.ts";

import type { TupIndex, TupN } from "../internal/tuple.ts";
import {
  alignOfMatCxR,
  sizeOfMatCxR,
  strideOf,
} from "../internal/alignment.ts";

const NCol = 3;
const NRow = 3;

type MatrixType<R> = TupN<ColumnType<R>, typeof NCol>;
type ColumnType<R> = TupN<R, typeof NRow>;

type Index0 = TupIndex<MatrixType<unknown>>;
type Index1 = TupIndex<ColumnType<unknown>>;

/**
 * A 3x3 matrix type. The components are stored in column-major order per WGSL.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#matrix-types
 */
export class Mat3x3<
  T extends IType<R, V> & FloatingPointType,
  R = ITypeR<T>,
  V = ITypeV<T>,
> implements IType<MatrixType<R>, V> {
  #type: T;
  #byteSize: number;
  #alignment: number;
  #arrayStride: number;

  constructor(type: T) {
    assertTypeOneOf(type, GPU_FLOATING_POINT_TYPES);
    this.#type = type;
    this.#byteSize = sizeOfMatCxR(NCol, NRow, type.type);
    this.#alignment = alignOfMatCxR(NCol, NRow, type.type);
    this.#arrayStride = strideOf(this.#alignment, this.#byteSize);
  }

  toString(): string {
    return `mat${NCol}x${NRow}<${String(this.#type)}>`;
  }

  get type(): typeof GPU_MAT3X3 {
    return GPU_MAT3X3;
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

  read(view: DataView, offset: number = 0): MatrixType<R> {
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

  write(view: DataView, value: MatrixType<R>, offset: number = 0) {
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

  readAt(view: DataView, index: number, offset: number = 0): MatrixType<R> {
    return this.read(view, index * this.arrayStride + offset);
  }

  writeAt(
    view: DataView,
    index: number,
    value: MatrixType<R>,
    offset: number = 0,
  ) {
    this.write(view, value, index * this.arrayStride + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): V {
    return this.#type.view(
      buffer,
      offset,
      length * this.#byteSize / this.#type.byteSize,
    );
  }

  get(view: DataView, column: Index0, row: Index1, offset: number = 0): R {
    return this.#type.read(view, this.#offset(column, row) + offset);
  }

  set(
    view: DataView,
    column: Index0,
    row: Index1,
    value: R,
    offset: number = 0,
  ) {
    this.#type.write(view, value, this.#offset(column, row) + offset);
  }

  #offset(column: Index0, row: Index1): number {
    const columnVectorOffset = column * this.#alignment;
    const rowComponentOffset = row * this.#type.byteSize;
    return columnVectorOffset + rowComponentOffset;
  }
}
