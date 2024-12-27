import {
  GPU_FLOATING_POINT_TYPES,
  GPU_MAT3X3,
  type MatrixType,
  type MemoryType,
  type MemoryTypeBoundedVF,
  type MemoryTypeR,
  type MemoryTypeV,
} from "../types.ts";

import type { FloatingPointType } from "../scalar/mod.ts";

import { assertTypeOneOf } from "../internal/assert.ts";

import type { TupIndexN, TupIndexNM, TupNM } from "../internal/tuple.ts";
import {
  alignOfMatCxR,
  sizeOfMatCxR,
  strideOf,
} from "../internal/alignment.ts";

const NCol: 3 = 3 as const;
const NRow: 3 = 3 as const;

/**
 * A 3x3 matrix type. The components are stored in column-major order per WGSL.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#matrix-types
 */
export class Mat3x3<
  T extends MemoryType<R, V, VF> & FloatingPointType,
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
    this.setAt(view, 0, 0, value[0][0], offset);
    this.setAt(view, 0, 1, value[0][1], offset);
    this.setAt(view, 0, 2, value[0][2], offset);
    this.setAt(view, 1, 0, value[1][0], offset);
    this.setAt(view, 1, 1, value[1][1], offset);
    this.setAt(view, 1, 2, value[1][2], offset);
    this.setAt(view, 2, 0, value[2][0], offset);
    this.setAt(view, 2, 1, value[2][1], offset);
    this.setAt(view, 2, 2, value[2][2], offset);
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

  #offset(
    column: TupIndexN<typeof NCol>,
    row: TupIndexN<typeof NRow>,
  ): number {
    const columnVectorOffset = column * this.#alignment;
    const rowComponentOffset = row * this.#type.byteSize;
    return columnVectorOffset + rowComponentOffset;
  }
}
