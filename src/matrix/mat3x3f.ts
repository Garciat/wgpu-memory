import {
  alignOfMatCxR,
  sizeOfMatCxR,
  strideOf,
} from "../internal/alignment.ts";
import { invariant } from "../internal/assert.ts";
import type {
  TupCxR,
  TupIndexN,
  TupIndexNM,
  TupNM,
} from "../internal/tuple.ts";

import { Float32Type } from "../scalar/f32.ts";

import { GPU_MAT3X3, type MatrixType } from "../types.ts";
import { matrixToCode, matrixToString } from "./common.ts";

const ComponentType: Float32Type = new Float32Type();
type ComponentArrayType = Float32Array;

const NCol = 3 as const;
const NRow = 3 as const;

const ByteSize = 48;
const Alignment = 16;
const ArrayStride = 48;
const ComponentSize = 4;

invariant(sizeOfMatCxR(NCol, NRow, ComponentType.type) === ByteSize, "size");
invariant(alignOfMatCxR(NCol, NRow, ComponentType.type) === Alignment, "align");
invariant(strideOf(Alignment, ByteSize) === ArrayStride, "stride");
invariant(ComponentType.byteSize === ComponentSize, "component size");

const Step0 = ArrayStride;
const Step1 = Alignment;
const Step2 = ComponentSize;

/**
 * A 3x3 matrix of Float32. The components are stored in column-major order per WGSL.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#matrix-types
 */
export class Mat3x3F
  implements MatrixType<typeof ComponentType, typeof NCol, typeof NRow> {
  /**
   * The shape of the matrix.
   */
  get shape(): [typeof NCol, typeof NRow] {
    return [NCol, NRow];
  }

  /**
   * The component type of the matrix.
   */
  get componentType(): typeof ComponentType {
    return ComponentType;
  }

  /**
   * @inheritdoc
   */
  toString(): string {
    return matrixToString(this);
  }

  /**
   * @inheritdoc
   */
  toCode(namespace: string): string {
    return matrixToCode(this, namespace);
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
    return ByteSize;
  }

  /**
   * @inheritdoc
   */
  get alignment(): number {
    return Alignment;
  }

  /**
   * @inheritdoc
   */
  get arrayStride(): number {
    return ArrayStride;
  }

  /**
   * @inheritdoc
   */
  read(
    view: DataView,
    offset: number = 0,
  ): TupNM<number, typeof NCol, typeof NRow> {
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
    value: TupNM<number, typeof NCol, typeof NRow>,
    offset: number = 0,
  ) {
    for (let i = 0; i < NCol; i++) {
      for (let j = 0; j < NRow; j++) {
        ComponentType.write(
          view,
          value[i][j],
          i * Step1 + j * Step2 + offset,
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
  ): TupNM<number, typeof NCol, typeof NRow> {
    return this.read(view, index * Step0 + offset);
  }

  /**
   * @inheritdoc
   */
  writeAt(
    view: DataView,
    index: number,
    value: TupNM<number, typeof NCol, typeof NRow>,
    offset: number = 0,
  ) {
    for (let i = 0; i < NCol; i++) {
      for (let j = 0; j < NRow; j++) {
        ComponentType.write(
          view,
          value[i][j],
          index * Step0 +
            i * Step1 +
            j * Step2 +
            offset,
        );
      }
    }
  }

  /**
   * @inheritdoc
   */
  readAtFlat(
    view: DataView,
    index: number,
    offset: number = 0,
  ): TupCxR<number, typeof NCol, typeof NRow> {
    return [
      ComponentType.read(view, index * Step0 + 0 * Step1 + 0 * Step2 + offset),
      ComponentType.read(view, index * Step0 + 0 * Step1 + 1 * Step2 + offset),
      ComponentType.read(view, index * Step0 + 0 * Step1 + 2 * Step2 + offset),
      ComponentType.read(view, index * Step0 + 1 * Step1 + 0 * Step2 + offset),
      ComponentType.read(view, index * Step0 + 1 * Step1 + 1 * Step2 + offset),
      ComponentType.read(view, index * Step0 + 1 * Step1 + 2 * Step2 + offset),
      ComponentType.read(view, index * Step0 + 2 * Step1 + 0 * Step2 + offset),
      ComponentType.read(view, index * Step0 + 2 * Step1 + 1 * Step2 + offset),
      ComponentType.read(view, index * Step0 + 2 * Step1 + 2 * Step2 + offset),
    ];
  }

  /**
   * @inheritdoc
   */
  writeAtFlat(
    view: DataView,
    index: number,
    value: TupCxR<number, typeof NCol, typeof NRow>,
    offset: number = 0,
  ) {
    for (let i = 0; i < NCol; i++) {
      for (let j = 0; j < NRow; j++) {
        ComponentType.write(
          view,
          value[i * NRow + j],
          index * Step0 +
            i * Step1 +
            j * Step2 +
            offset,
        );
      }
    }
  }

  /**
   * @inheritdoc
   */
  view(
    buffer: ArrayBuffer,
    offset: number = 0,
    length: number = 1,
  ): ComponentArrayType {
    return ComponentType.view(
      buffer,
      offset,
      length * ArrayStride / ComponentSize,
    );
  }

  /**
   * @inheritdoc
   */
  viewAt(
    buffer: ArrayBuffer,
    index: number,
    offset: number = 0,
  ): ComponentArrayType {
    return ComponentType.view(
      buffer,
      index * Step0 + offset,
      ByteSize / ComponentSize,
    );
  }

  /**
   * @inheritdoc
   */
  get(
    view: DataView,
    indices: TupIndexNM<typeof NCol, typeof NRow>,
    offset: number = 0,
  ): number {
    return this.getAt(view, indices[0], indices[1], offset);
  }

  /**
   * @inheritdoc
   */
  set(
    view: DataView,
    indices: TupIndexNM<typeof NCol, typeof NRow>,
    value: number,
    offset: number = 0,
  ) {
    this.setAt(view, indices[0], indices[1], value, offset);
  }

  /**
   * @inheritdoc
   */
  offset(indices: TupIndexNM<typeof NCol, typeof NRow>): number {
    return indices[0] * Step1 + indices[1] * Step2;
  }

  /**
   * @inheritdoc
   */
  getAt(
    view: DataView,
    column: TupIndexN<typeof NCol>,
    row: TupIndexN<typeof NRow>,
    offset: number = 0,
  ): number {
    return ComponentType.read(view, column * Step1 + row * Step2 + offset);
  }

  /**
   * @inheritdoc
   */
  setAt(
    view: DataView,
    column: TupIndexN<typeof NCol>,
    row: TupIndexN<typeof NRow>,
    value: number,
    offset: number = 0,
  ) {
    ComponentType.write(view, value, column * Step1 + row * Step2 + offset);
  }

  /**
   * @inheritdoc
   */
  getAtIndexed(
    view: DataView,
    index: number,
    column: TupIndexN<typeof NCol>,
    row: TupIndexN<typeof NRow>,
    offset: number = 0,
  ): number {
    return ComponentType.read(
      view,
      index * Step0 +
        column * Step1 +
        row * Step2 +
        offset,
    );
  }

  /**
   * @inheritdoc
   */
  setAtIndexed(
    view: DataView,
    index: number,
    column: TupIndexN<typeof NCol>,
    row: TupIndexN<typeof NRow>,
    value: number,
    offset: number = 0,
  ) {
    ComponentType.write(
      view,
      value,
      index * Step0 +
        column * Step1 +
        row * Step2 +
        offset,
    );
  }
}
