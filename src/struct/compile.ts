import { CodeGen } from "../internal/codegen.ts";
import type { NonEmpty } from "../internal/constraints.ts";
import type {
  MemoryType,
  MemoryTypeR,
  MemoryTypeV,
  MemoryTypeVF,
  StructDescriptor,
  StructField,
  StructType,
} from "../types.ts";
import { structToCode } from "./string.ts";
import type { StructTypeImpl } from "./struct.ts";

/**
 * Uses code generation to create a specialized structure class.
 */
export function compile<S extends NonEmpty<StructDescriptor<S>>>(
  struct: StructTypeImpl<S>,
): StructType<S> {
  const inputs = {
    utils: {
      toCodeImpl: {
        name: "param_toCodeImpl",
        value: structToCode,
      },
    },
    fieldTypes: struct.fieldList.map((field) => ({
      name: `param_fieldType_${String(field.name)}`,
      value: field.type,
    })),
  };

  const classDefinition = generateStructClass(
    struct,
    inputs,
  );

  const classObject = CodeGen.evaluate(
    [
      ...Object.values(inputs.utils),
      ...inputs.fieldTypes,
    ],
    classDefinition,
  );

  Object.defineProperty(classObject, "__source", {
    value: classDefinition,
    writable: false,
    enumerable: false,
    configurable: false,
  });

  return classObject as StructType<S>;
}

type StructCodeGenParams = {
  utils: {
    toCodeImpl: { name: string };
  };
  fieldTypes: Array<{ name: string }>;
};

function generateStructClass<S extends NonEmpty<StructDescriptor<S>>>(
  struct: StructTypeImpl<S>,
  params: StructCodeGenParams,
): string {
  const nameOf = <K>(field: { name: K }) => String(field.name);

  const typeOf = (field: { index: number }) =>
    params.fieldTypes[field.index].name;

  return `
class GeneratedStruct {
  static fields = Object.freeze(${
    CodeGen.objectLiteral(
      struct.fieldList,
      (field) => nameOf(field),
      (field) =>
        generateFieldAccessorClass(
          struct,
          field,
          typeOf(field),
        ),
    )
  });

  static toString() {
    return "${struct.toString()}";
  }

  static toCode(namespace, indentation=0) {
    return ${params.utils.toCodeImpl.name}(this, namespace, indentation);
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
      struct.fieldList,
      (field) => nameOf(field),
      (field) => `${typeOf(field)}.read(view, ${field.offset} + offset)`,
    )
  };
  }

  static write(view, values, offset = 0) {
    ${
    CodeGen.statements(
      struct.fieldList,
      (field) => {
        const t = typeOf(field);
        const k = nameOf(field);
        return `${t}.write(view, values.${k}, ${field.offset} + offset);`;
      },
    )
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
      struct.fieldList,
      (field) => nameOf(field),
      (field) =>
        `${typeOf(field)}.viewAt(buffer, 0, ${field.offset} + effectiveOffset)`,
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
  struct: StructTypeImpl<S>,
  field: StructField<S, Key, T, R, V, VF>,
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
