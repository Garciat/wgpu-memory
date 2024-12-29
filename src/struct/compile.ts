import type { NonEmpty } from "../internal/constraints.ts";
import type {
  MemoryType,
  MemoryTypeR,
  MemoryTypeV,
  MemoryTypeVF,
} from "../types.ts";
import { toCodeImpl } from "./string.ts";
import type { Struct } from "./struct.ts";
import type { IStruct, IStructField, StructDescriptor } from "./types.ts";

/**
 * Uses code generation to create a specialized structure class.
 */
export function compile<S extends NonEmpty<StructDescriptor<S>>>(
  struct: Struct<S>,
): IStruct<S> {
  const toCodeImplParam = "param_toCodeImpl";

  const typeParams = struct.fieldList.map((field) =>
    `param_fieldType_${String(field.name)}`
  );
  const typeArgs = struct.fieldList.map((field) => field.type);

  const source = generateStructClass(struct, toCodeImplParam, typeParams);

  const clazz = Function(
    toCodeImplParam,
    ...typeParams,
    `return ${source};`,
  )(toCodeImpl, ...typeArgs) as IStruct<S>;

  Object.defineProperty(clazz, "__source", {
    value: source,
    writable: false,
    enumerable: false,
    configurable: false,
  });

  return clazz;
}

function generateStructClass<S extends NonEmpty<StructDescriptor<S>>>(
  struct: Struct<S>,
  toCodeImplParam: string,
  fieldTypeParams: Array<string>,
): string {
  return `
class GeneratedStruct {
  static fields = Object.freeze(${
    CodeGen.objectLiteral(
      struct.fieldList.map((field) => [
        String(field.name),
        generateFieldAccessorClass(
          struct,
          field,
          fieldTypeParams[field.index],
        ),
      ]),
    )
  });

  static toString() {
    return "${struct.toString()}";
  }

  static toCode(namespace, indentation=0) {
    return ${toCodeImplParam}(this, namespace, indentation);
  }

  static get type() {
    return "${struct.type}";
  }

  static get byteSize() {
    return ${struct.byteSize};
  }

  static get alignment() {
    return ${struct.alignment};
  }

  static get arrayStride() {
    return ${struct.arrayStride};
  }

  static read(view, offset = 0) {
    return ${
    CodeGen.objectLiteral(
      struct.fieldList.map((field) => [
        String(field.name),
        `${fieldTypeParams[field.index]}.read(view, ${field.offset} + offset)`,
      ]),
    )
  };
  }

  static write(view, values, offset = 0) {
    ${
    struct.fieldList
      .map(
        (field) =>
          `${fieldTypeParams[field.index]}.write(view, values.${
            String(field.name)
          }, ${field.offset} + offset);`,
      )
      .join("\n")
  }
  }

  static readAt(view, index, offset = 0) {
    return this.read(view, index * ${struct.arrayStride} + offset);
  }

  static writeAt(view, index, value, offset = 0) {
    this.write(view, value, index * ${struct.arrayStride} + offset);
  }

  static viewAt(buffer, index, offset = 0) {
    const effectiveOffset = index * ${struct.arrayStride} + offset;
    return ${
    CodeGen.objectLiteral(
      struct.fieldList.map((field) => [
        String(field.name),
        `${
          fieldTypeParams[field.index]
        }.viewAt(buffer, 0, ${field.offset} + effectiveOffset)`,
      ]),
    )
  };
  }
}
  `.trim();
}

function generateFieldAccessorClass<
  S extends NonEmpty<StructDescriptor<S>>,
  Key extends keyof S,
  T extends MemoryType<R, V, VF> = S[Key]["type"],
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF = MemoryTypeVF<T>,
>(
  struct: Struct<S>,
  field: IStructField<S, Key, T, R, V, VF>,
  fieldTypeParam: string,
): string {
  return `
class GeneratedFieldAccessor {
  static get index() {
    return ${field.index};
  }

  static get name() {
    return "${String(field.name)}";
  }

  static get type() {
    return ${fieldTypeParam};
  }

  static get byteSize() {
    return ${field.byteSize};
  }

  static get alignment() {
    return ${field.alignment};
  }

  static get offset() {
    return ${field.offset};
  }

  static read(view, offset = 0) {
    return ${fieldTypeParam}.read(view, ${field.offset} + offset);
  }

  static write(view, value, offset = 0) {
    ${fieldTypeParam}.write(view, value, ${field.offset} + offset);
  }

  static readAt(view, index, offset = 0) {
    return ${fieldTypeParam}.read(view, index * ${struct.arrayStride} + ${field.offset} + offset);
  }

  static writeAt(view, index, value, offset = 0) {
    ${fieldTypeParam}.write(view, value, index * ${struct.arrayStride} + ${field.offset} + offset);
  }

  static viewAt(buffer, index, offset = 0) {
    return ${fieldTypeParam}.viewAt(buffer, 0, index * ${struct.arrayStride} + ${field.offset} + offset);
  }
}
  `.trim();
}

class CodeGen {
  static objectLiteral(
    fields: Array<[string, string]>,
  ): string {
    return [
      "{",
      ...fields.map(([name, value]) => `${name}: ${value},`),
      `}`,
    ].join("\n");
  }
}
