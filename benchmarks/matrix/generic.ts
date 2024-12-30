import {
  alignOfMatCxR,
  sizeOfMatCxR,
  strideOf,
} from "../../src/internal/alignment.ts";
import {
  makeEmptyTupN,
  type TupCxR,
  type TupIndexN,
  type TupIndexNM,
  type TupN,
  type TupNM,
} from "../../src/internal/tuple.ts";
import type { FloatingPointType } from "../../src/scalar/mod.ts";
import {
  GPU_MAT2X2,
  GPU_MAT3X3,
  GPU_MAT4X4,
  type GPUMatrixType,
  type MatrixType,
  type MemoryType,
  type MemoryTypeBoundedVF,
  type MemoryTypeR,
  type MemoryTypeV,
} from "../../src/types.ts";

export class MatCxR<
  T extends MemoryType<R, V, VF> & FloatingPointType,
  NCol extends 2 | 3 | 4,
  NRow extends 2 | 3 | 4,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
> implements MatrixType<T, NCol, NRow, R, V, VF> {
  #type: T;
  #nc: NCol;
  #nr: NRow;
  #byteSize: number;
  #alignment: number;
  #arrayStride: number;

  constructor(type: T, nc: NCol, nr: NRow) {
    this.#type = type;
    this.#nc = nc;
    this.#nr = nr;
    this.#byteSize = sizeOfMatCxR(nc, nr, type.type);
    this.#alignment = alignOfMatCxR(nc, nr, type.type);
    this.#arrayStride = strideOf(this.#alignment, this.#byteSize);
  }

  get shape(): [NCol, NRow] {
    return [this.#nc, this.#nr];
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
    return `mat${this.#nc}x${this.#nr}<${String(this.#type)}>`;
  }

  /**
   * @inheritdoc
   */
  toCode(namespace: string): string {
    switch (this.#type.type) {
      case "f32":
        return `${namespace}.Mat${this.#nc}x${this.#nr}F`;
      case "f16":
        return `${namespace}.Mat${this.#nc}x${this.#nr}H`;
    }
  }

  /**
   * @inheritdoc
   */
  get type(): GPUMatrixType {
    if (this.#nc === 2 && this.#nr === 2) {
      return GPU_MAT2X2;
    } else if (this.#nc === 3 && this.#nr === 3) {
      return GPU_MAT3X3;
    } else if (this.#nc === 4 && this.#nr === 4) {
      return GPU_MAT4X4;
    } else {
      throw new Error("Invalid matrix dimensions");
    }
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
  read(view: DataView, offset: number = 0): TupNM<R, NCol, NRow> {
    const step1 = this.#step1;
    const step2 = this.#step2;
    const cols = makeEmptyTupN<TupN<R, NRow>, NCol>(this.#nc);
    for (let i = 0; i < this.#nc; i++) {
      const row = makeEmptyTupN<R, NRow>(this.#nr);
      for (let j = 0; j < this.#nr; j++) {
        row[j] = this.#type.read(view, i * step1 + j * step2 + offset);
      }
      cols[i] = row;
    }
    return cols;
  }

  /**
   * @inheritdoc
   */
  write(
    view: DataView,
    value: TupNM<R, NCol, NRow>,
    offset: number = 0,
  ) {
    const step1 = this.#step1;
    const step2 = this.#step2;
    for (let i = 0; i < this.#nc; i++) {
      for (let j = 0; j < this.#nr; j++) {
        this.#type.write(
          view,
          value[i][j],
          i * step1 + j * step2 + offset,
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
  ): TupNM<R, NCol, NRow> {
    return this.read(view, index * this.arrayStride + offset);
  }

  /**
   * @inheritdoc
   */
  writeAt(
    view: DataView,
    index: number,
    value: TupNM<R, NCol, NRow>,
    offset: number = 0,
  ) {
    this.write(view, value, index * this.arrayStride + offset);
  }

  /**
   * @inheritdoc
   */
  writeAtFlat(
    view: DataView,
    index: number,
    value: TupCxR<R, NCol, NRow>,
    offset: number = 0,
  ) {
    const nc = this.#nc;
    const nr = this.#nr;
    const base = index * this.arrayStride + offset;
    const step1 = this.#step1;
    const step2 = this.#step2;
    for (let i = 0; i < nc; i++) {
      for (let j = 0; j < nr; j++) {
        this.#type.write(
          view,
          value[i * nr + j],
          i * step1 + j * step2 + base,
        );
      }
    }
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
    indices: TupIndexNM<NCol, NRow>,
    offset: number = 0,
  ): R {
    return this.getAt(view, indices[0], indices[1], offset);
  }

  set(
    view: DataView,
    indices: TupIndexNM<NCol, NRow>,
    value: R,
    offset: number = 0,
  ) {
    this.setAt(view, indices[0], indices[1], value, offset);
  }

  offset(indices: TupIndexNM<NCol, NRow>): number {
    return this.#offset(indices[0], indices[1]);
  }

  getAt(
    view: DataView,
    column: TupIndexN<NCol>,
    row: TupIndexN<NRow>,
    offset: number = 0,
  ): R {
    return this.#type.read(view, this.#offset(column, row) + offset);
  }

  setAt(
    view: DataView,
    column: TupIndexN<NCol>,
    row: TupIndexN<NRow>,
    value: R,
    offset: number = 0,
  ) {
    this.#type.write(view, value, this.#offset(column, row) + offset);
  }

  setAtIndexed(
    view: DataView,
    index: number,
    column: TupIndexN<NCol>,
    row: TupIndexN<NRow>,
    value: R,
    offset: number = 0,
  ) {
    this.#type.write(
      view,
      value,
      index * this.#arrayStride +
        this.#step1 * column +
        this.#step2 * row +
        offset,
    );
  }

  #offset(
    column: TupIndexN<NCol>,
    row: TupIndexN<NRow>,
  ): number {
    return this.#step1 * column + this.#step2 * row;
  }

  get #step1() {
    return this.#alignment;
  }

  get #step2() {
    return this.#type.byteSize;
  }
}
