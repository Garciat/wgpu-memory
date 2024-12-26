import {
  GPU_FLOATING_POINT_TYPES,
  GPU_MAT2X2,
  type IType,
  type ITypeBoundedVF,
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

const NCol = 2;
const NRow = 2;

type MatrixType<R> = TupN<ColumnType<R>, typeof NCol>;
type ColumnType<R> = TupN<R, typeof NRow>;

type Index0 = TupIndex<MatrixType<unknown>>;
type Index1 = TupIndex<ColumnType<unknown>>;

/**
 * A 2x2 matrix type. The components are stored in column-major order per WGSL.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#matrix-types
 */
export class Mat2x2<
  T extends IType<R, V, VF> & FloatingPointType,
  R = ITypeR<T>,
  V = ITypeV<T>,
  VF extends V = ITypeBoundedVF<T, V>,
> implements IType<MatrixType<R>, V, VF> {
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

  get type(): typeof GPU_MAT2X2 {
    return GPU_MAT2X2;
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
      ],
      [
        this.get(view, 1, 0, offset),
        this.get(view, 1, 1, offset),
      ],
    ];
  }

  write(view: DataView, value: MatrixType<R>, offset: number = 0) {
    this.set(view, 0, 0, value[0][0], offset);
    this.set(view, 0, 1, value[0][1], offset);
    this.set(view, 1, 0, value[1][0], offset);
    this.set(view, 1, 1, value[1][1], offset);
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

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): VF {
    return this.#type.view(
      buffer,
      offset,
      length * this.arrayStride / this.#type.byteSize,
    );
  }

  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): V {
    return this.#type.view(
      buffer,
      index * this.arrayStride + offset,
      this.byteSize / this.#type.byteSize,
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
