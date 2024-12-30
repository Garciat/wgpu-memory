import { CodeGen } from "../../src/internal/codegen.ts";
import type { FloatingPointType } from "../../src/scalar/mod.ts";
import type {
  MatrixType,
  MemoryType,
  MemoryTypeBoundedVF,
  MemoryTypeR,
  MemoryTypeV,
} from "../../src/types.ts";
import type { MatCxR } from "./generic.ts";

export function compile<
  T extends MemoryType<R, V, VF> & FloatingPointType,
  NCol extends 2 | 3 | 4,
  NRow extends 2 | 3 | 4,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(
  matrix: MatCxR<T, NCol, NRow, R, V, VF>,
): MatrixType<T, NCol, NRow, R, V, VF> & {
  setAtIndexed(
    view: DataView,
    index: number,
    column: number,
    row: number,
    value: R,
    offset?: number,
  ): void;

  writeAtFlat(
    view: DataView,
    index: number,
    value: R[],
    offset?: number,
  ): void;
} {
  const inputs = {
    componentType: { name: "param_componentType", value: matrix.componentType },
  };

  const classDefinition = generateMatrixClass(
    matrix,
    inputs,
  );

  const classObject = CodeGen.evaluate(
    Object.values(inputs),
    classDefinition,
  );

  Object.defineProperty(classObject, "__source", {
    value: classDefinition,
    writable: false,
    enumerable: false,
    configurable: false,
  });

  return classObject as MatrixType<T, NCol, NRow, R, V, VF> & {
    setAtIndexed(
      view: DataView,
      index: number,
      column: number,
      row: number,
      value: R,
      offset?: number,
    ): void;

    writeAtFlat(
      view: DataView,
      index: number,
      value: R[],
      offset?: number,
    ): void;
  };
}

interface MatrixCodeGenParams {
  componentType: { name: string };
}

function generateMatrixClass<
  T extends MemoryType<R, V, VF> & FloatingPointType,
  NCol extends 2 | 3 | 4,
  NRow extends 2 | 3 | 4,
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF extends V = MemoryTypeBoundedVF<T, V>,
>(matrix: MatrixType<T, NCol, NRow, R, V, VF>, params: MatrixCodeGenParams) {
  const NCol = matrix.shape[0];
  const NRow = matrix.shape[1];
  const type = params.componentType.name;
  const step0 = matrix.arrayStride;
  const step1 = matrix.alignment;
  const step2 = matrix.componentType.byteSize;
  return `
class GeneratedMatrix {
  static get shape(){
    return [${NCol}, ${NRow}];
  }

  static get componentType() {
    return ${type};
  }

  static toString() {
    return "${matrix.toString()}";
  }

  static toCode(namespace) {
    return namespace + "${matrix.toCode("")}";
  }

  static get type() {
    return "${matrix.type}";
  }

  static get byteSize() {
    return ${matrix.byteSize};
  }

  static get alignment() {
    return ${matrix.alignment};
  }

  static get arrayStride() {
    return ${matrix.arrayStride};
  }

  static read(view, offset = 0) {
    return [
      ${
    Array.from({ length: NCol }, (_, i) => `
      [
        ${
      Array.from(
        { length: NRow },
        (_, j) => `${type}.read(view, ${i * step1 + j * step2} + offset),`,
      ).join("\n")
    }
      ]
      `).join(",")
  }
    ];
  }

  static write(view, value, offset = 0) {
    for (let i = 0; i < ${NCol}; i++) {
      for (let j = 0; j < ${NRow}; j++) {
        ${type}.write(
          view,
          value[i][j],
          i * ${step1} + j * ${step2} + offset,
        );
      }
    }
  }

  static readAt(view, index, offset = 0) {
    return this.read(view, ${step0} * index + offset);
  }

  static writeAt(view, index, value, offset = 0)  {
    for (let i = 0; i < ${NCol}; i++) {
      for (let j = 0; j < ${NRow}; j++) {
        ${type}.write(
          view,
          value[i][j],
          index * ${step0} +
            i * ${step1} +
            j * ${step2} +
            offset,
        );
      }
    }
  }

  static writeAtFlat(view, index, value, offset = 0) {
    for (let i = 0; i < ${NCol}; i++) {
      for (let j = 0; j < ${NRow}; j++) {
        ${type}.write(
          view,
          value[i * ${NRow} + j],
          index * ${step0} +
            i * ${step1} +
            j * ${step2} +
            offset,
        );
      }
    }
  }

  static view(buffer, offset = 0, length = 1) {
    return ${type}.view(
      buffer,
      offset,
      length * ${matrix.arrayStride / matrix.componentType.byteSize},
    );
  }

  static viewAt(buffer, index, offset = 0) {
    return ${type}.view(
      buffer,
      index * ${step0} + offset,
      ${matrix.byteSize / matrix.componentType.byteSize},
    );
  }

  static get(view, indices, offset = 0) {
    return ${type}.read(view, indices[0] * ${step1} + indices[1] * ${step2} + offset);
  }

  static set(view, indices, value, offset = 0) {
    ${type}.write(view, value, indices[0] * ${step1} + indices[1] * ${step2} + offset);
  }

  static offset(indices) {
    return indices[0] * ${step1} + indices[1] * ${step2};
  }

  static getAt(view, column, row, offset = 0) {
    return ${type}.read(view, ${step1} * column + ${step2} * row + offset);
  }

  static setAt(view, column, row, value, offset = 0) {
    ${type}.write(view, value, ${step1} * column + ${step2} * row + offset);
  }

  static getAtIndexed(view, index, column, row, offset = 0) {
    return ${type}.read(view, index * ${step0} + column * ${step1} + row * ${step2} + offset);
  }

  static setAtIndexed(view, index, column, row, value, offset = 0) {
    ${type}.write(view, value, index * ${step0} + column * ${step1} + row * ${step2} + offset);
  }
}
  `.trim();
}
