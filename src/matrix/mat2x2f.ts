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

import { Float32TypeImpl } from "../scalar/f32.ts";

import { type Float32Type, GPU_MAT2X2, type MatrixType } from "../types.ts";
import { matrixToCode, matrixToString } from "./common.ts";

const ComponentType: Float32TypeImpl = new Float32TypeImpl();
type ComponentArrayType = Float32Array;

const NCol = 2 as const;
const NRow = 2 as const;

const ByteSize = 16;
const Alignment = 8;
const ArrayStride = 16;
const ComponentSize = 4;

invariant(sizeOfMatCxR(NCol, NRow, ComponentType.type) === ByteSize, "size");
invariant(alignOfMatCxR(NCol, NRow, ComponentType.type) === Alignment, "align");
invariant(strideOf(Alignment, ByteSize) === ArrayStride, "stride");
invariant(ComponentType.byteSize === ComponentSize, "component size");

const Step0 = ArrayStride;
const Step1 = Alignment;
const Step2 = ComponentSize;

export class Mat2x2F
  implements MatrixType<Float32Type, typeof NCol, typeof NRow> {
  get shape(): [typeof NCol, typeof NRow] {
    return [NCol, NRow];
  }

  get componentType(): Float32Type {
    return ComponentType;
  }

  toString(): string {
    return matrixToString(this);
  }

  toCode(namespace: string): string {
    return matrixToCode(this, namespace);
  }

  get type(): typeof GPU_MAT2X2 {
    return GPU_MAT2X2;
  }

  get byteSize(): number {
    return ByteSize;
  }

  get alignment(): number {
    return Alignment;
  }

  get arrayStride(): number {
    return ArrayStride;
  }

  read(
    view: DataView,
    offset: number = 0,
  ): TupNM<number, typeof NCol, typeof NRow> {
    return [
      [
        this.getAt(view, 0, 0, offset),
        this.getAt(view, 0, 1, offset),
      ],
      [
        this.getAt(view, 1, 0, offset),
        this.getAt(view, 1, 1, offset),
      ],
    ];
  }

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

  readAt(
    view: DataView,
    index: number,
    offset: number = 0,
  ): TupNM<number, typeof NCol, typeof NRow> {
    return this.read(view, index * Step0 + offset);
  }

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

  readAtFlat(
    view: DataView,
    index: number,
    offset: number = 0,
  ): TupCxR<number, typeof NCol, typeof NRow> {
    return [
      ComponentType.read(view, index * Step0 + 0 * Step1 + 0 * Step2 + offset),
      ComponentType.read(view, index * Step0 + 0 * Step1 + 1 * Step2 + offset),
      ComponentType.read(view, index * Step0 + 1 * Step1 + 0 * Step2 + offset),
      ComponentType.read(view, index * Step0 + 1 * Step1 + 1 * Step2 + offset),
    ];
  }

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

  get(
    view: DataView,
    indices: TupIndexNM<typeof NCol, typeof NRow>,
    offset: number = 0,
  ): number {
    return this.getAt(view, indices[0], indices[1], offset);
  }

  set(
    view: DataView,
    indices: TupIndexNM<typeof NCol, typeof NRow>,
    value: number,
    offset: number = 0,
  ) {
    this.setAt(view, indices[0], indices[1], value, offset);
  }

  offset(indices: TupIndexNM<typeof NCol, typeof NRow>): number {
    return indices[0] * Step1 + indices[1] * Step2;
  }

  getAt(
    view: DataView,
    column: TupIndexN<typeof NCol>,
    row: TupIndexN<typeof NRow>,
    offset: number = 0,
  ): number {
    return ComponentType.read(view, column * Step1 + row * Step2 + offset);
  }

  setAt(
    view: DataView,
    column: TupIndexN<typeof NCol>,
    row: TupIndexN<typeof NRow>,
    value: number,
    offset: number = 0,
  ) {
    ComponentType.write(view, value, column * Step1 + row * Step2 + offset);
  }

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
