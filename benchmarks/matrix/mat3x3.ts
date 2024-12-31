import {
  type AnyFloatingPointType,
  GPU_FLOATING_POINT_TYPES,
  GPU_MAT3X3,
  type MatrixType,
  type MemoryType,
  type MemoryTypeBoundedVF,
  type MemoryTypeR,
  type MemoryTypeV,
} from "../../src/types.ts";

import { assertTypeOneOf } from "../../src/internal/assert.ts";

import type {
  TupCxR,
  TupIndexN,
  TupIndexNM,
  TupNM,
} from "../../src/internal/tuple.ts";
import {
  alignOfMatCxR,
  sizeOfMatCxR,
  strideOf,
} from "../../src/internal/alignment.ts";

const NCol: 3 = 3 as const;
const NRow: 3 = 3 as const;

/**
 * A 3x3 matrix type. The components are stored in column-major order per WGSL.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#matrix-types
 */
export class Mat3x3<
  T extends MemoryType<R, V, VF> & AnyFloatingPointType,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
> implements MatrixType<T, typeof NCol, typeof NRow, R, V, VF> {
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

  /**
   * The shape of the matrix.
   */
  get shape(): [3, 3] {
    return [3, 3];
  }

  /**
   * The component type of the matrix.
   */
  get componentType(): T {
    return this.#type;
  }

  /**
   * @inheritdoc
   */
  toString(): string {
    return `mat${NCol}x${NRow}<${String(this.#type)}>`;
  }

  /**
   * @inheritdoc
   */
  toCode(namespace: string): string {
    switch (this.#type.type) {
      case "f32":
        return `${namespace}.Mat${NCol}x${NRow}F`;
      case "f16":
        return `${namespace}.Mat${NCol}x${NRow}H`;
    }
  }

  /**
   * @inheritdoc
   */
  get type(): typeof GPU_MAT3X3 {
    return GPU_MAT3X3;
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
  read(view: DataView, offset: number = 0): TupNM<R, typeof NCol, typeof NRow> {
    return [
      [
        this.getAt(view, 0, 0, offset),
        this.getAt(view, 0, 1, offset),
        this.getAt(view, 0, 2, offset),
      ],
      [
        this.getAt(view, 1, 0, offset),
        this.getAt(view, 1, 1, offset),
        this.getAt(view, 1, 2, offset),
      ],
      [
        this.getAt(view, 2, 0, offset),
        this.getAt(view, 2, 1, offset),
        this.getAt(view, 2, 2, offset),
      ],
    ];
  }

  /**
   * @inheritdoc
   */
  write(
    view: DataView,
    value: TupNM<R, typeof NCol, typeof NRow>,
    offset: number = 0,
  ) {
    const dim1 = this.#alignment;
    const dim2 = this.#type.byteSize;
    for (let i = 0; i < NCol; i++) {
      for (let j = 0; j < NRow; j++) {
        this.#type.write(
          view,
          value[i][j],
          i * dim1 + j * dim2 + offset,
        );
      }
    }
  }

  /**
   * @inheritdoc
   */
  readAt(
    view: DataView,
    index: number,
    offset: number = 0,
  ): TupNM<R, typeof NCol, typeof NRow> {
    return this.read(view, index * this.arrayStride + offset);
  }

  /**
   * @inheritdoc
   */
  writeAt(
    view: DataView,
    index: number,
    value: TupNM<R, typeof NCol, typeof NRow>,
    offset: number = 0,
  ) {
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
    return this.#type.view(
      buffer,
      index * this.arrayStride + offset,
      this.byteSize / this.#type.byteSize,
    );
  }

  get(
    view: DataView,
    indices: TupIndexNM<typeof NCol, typeof NRow>,
    offset: number = 0,
  ): R {
    return this.getAt(view, indices[0], indices[1], offset);
  }

  set(
    view: DataView,
    indices: TupIndexNM<typeof NCol, typeof NRow>,
    value: R,
    offset: number = 0,
  ) {
    this.setAt(view, indices[0], indices[1], value, offset);
  }

  offset(indices: TupIndexNM<typeof NCol, typeof NRow>): number {
    return this.#offset(indices[0], indices[1]);
  }

  getAt(
    view: DataView,
    column: TupIndexN<typeof NCol>,
    row: TupIndexN<typeof NRow>,
    offset: number = 0,
  ): R {
    return this.#type.read(view, this.#offset(column, row) + offset);
  }

  setAt(
    view: DataView,
    column: TupIndexN<typeof NCol>,
    row: TupIndexN<typeof NRow>,
    value: R,
    offset: number = 0,
  ) {
    this.#type.write(view, value, this.#offset(column, row) + offset);
  }

  /**
   * @inheritdoc
   */
  readAtFlat(
    view: DataView,
    index: number,
    offset?: number,
  ): TupCxR<R, typeof NCol, typeof NRow> {
    return [
      this.getAtIndexed(view, index, 0, 0, offset),
      this.getAtIndexed(view, index, 0, 1, offset),
      this.getAtIndexed(view, index, 0, 2, offset),
      this.getAtIndexed(view, index, 1, 0, offset),
      this.getAtIndexed(view, index, 1, 1, offset),
      this.getAtIndexed(view, index, 1, 2, offset),
      this.getAtIndexed(view, index, 2, 0, offset),
      this.getAtIndexed(view, index, 2, 1, offset),
      this.getAtIndexed(view, index, 2, 2, offset),
    ];
  }

  /**
   * @inheritdoc
   */
  writeAtFlat(
    view: DataView,
    index: number,
    value: TupCxR<R, typeof NCol, typeof NRow>,
    offset: number = 0,
  ) {
    const dim1 = this.#alignment;
    const dim2 = this.#type.byteSize;
    for (let i = 0; i < NCol; i++) {
      for (let j = 0; j < NRow; j++) {
        this.#type.write(
          view,
          value[i * NRow + j],
          index * this.arrayStride + i * dim1 + j * dim2 + offset,
        );
      }
    }
  }

  getAtIndexed(
    view: DataView,
    index: number,
    column: TupIndexN<typeof NCol>,
    row: TupIndexN<typeof NRow>,
    offset: number = 0,
  ): R {
    return this.#type.read(
      view,
      index * this.#arrayStride + this.#offset(column, row) + offset,
    );
  }

  setAtIndexed(
    view: DataView,
    index: number,
    column: TupIndexN<typeof NCol>,
    row: TupIndexN<typeof NRow>,
    value: R,
    offset: number = 0,
  ) {
    this.#type.write(
      view,
      value,
      index * this.#arrayStride + this.#offset(column, row) + offset,
    );
  }

  #offset(
    column: TupIndexN<typeof NCol>,
    row: TupIndexN<typeof NRow>,
  ): number {
    const columnVectorOffset = column * this.#alignment;
    const rowComponentOffset = row * this.#type.byteSize;
    return columnVectorOffset + rowComponentOffset;
  }
}
