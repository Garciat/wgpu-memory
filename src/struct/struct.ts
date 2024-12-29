import {
  GPU_STRUCT,
  type MemoryType,
  type MemoryTypeR,
  type MemoryTypeV,
  type MemoryTypeVF,
} from "../types.ts";
import type { NonEmpty } from "../internal/constraints.ts";
import { wgslRoundUp } from "../internal/math.ts";
import { typedObjectKeys } from "../internal/utils.ts";
import { strideOf } from "../internal/alignment.ts";

/**
 * A constructor for structure types.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#struct-types
 */
export class Struct<S extends NonEmpty<StructDescriptor<S>>>
  implements IStruct<S> {
  #fields: Array<StructField<S, keyof S>>;
  #fieldsByName: StructFieldsOf<S>;
  #alignment: number;
  #byteSize: number;
  #arrayStride: number;

  /**
   * @see https://gpuweb.github.io/gpuweb/wgsl/#structure-member-layout
   */
  constructor(descriptor: S) {
    let offset = 0;
    let alignment = 0;

    this.#fields = Array(Object.keys(descriptor).length);
    this.#fieldsByName = {} as StructFieldsOf<S>;

    for (const name of typedObjectKeys(descriptor)) {
      const fieldDescriptor = descriptor[name];
      const fieldType = fieldDescriptor.type as MemoryType<
        unknown,
        unknown,
        unknown
      >;

      if (fieldDescriptor.index > 0) {
        // Align the offset
        offset = wgslRoundUp(fieldType.alignment, offset);
      }

      const field = new StructField(this, fieldDescriptor, name, offset);
      this.#fields[fieldDescriptor.index] = field;
      this.#fieldsByName[name] = field;

      offset += fieldType.byteSize;
      alignment = Math.max(alignment, fieldType.alignment);
    }

    this.#alignment = alignment;
    this.#byteSize = wgslRoundUp(alignment, offset);
    this.#arrayStride = strideOf(this.#alignment, this.#byteSize);
  }

  /**
   * @returns Field accessors for the structure.
   */
  get fields(): StructFieldsOf<S> {
    return this.#fieldsByName;
  }

  /**
   * @private
   */
  get fieldList(): Array<StructField<S, keyof S>> {
    return this.#fields;
  }

  /**
   * @inheritdoc
   */
  toString(): string {
    return toWgslImpl(this);
  }

  /**
   * @inheritdoc
   */
  toCode(namespace: string, indentation: number = 0): string {
    return toCodeImpl(this, namespace, indentation);
  }

  /**
   * @inheritdoc
   */
  get type(): typeof GPU_STRUCT {
    return GPU_STRUCT;
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
  read(view: DataView, offset: number = 0): StructR<S> {
    const obj = {} as StructR<S>;

    for (const field of this.#fields) {
      obj[field.name] = field.read(view, offset);
    }

    return obj;
  }

  /**
   * @inheritdoc
   */
  write(view: DataView, values: StructR<S>, offset: number = 0) {
    for (const name of typedObjectKeys(this.#fieldsByName)) {
      const field = this.#fieldsByName[name];
      field.write(view, values[name], offset);
    }
  }

  /**
   * @inheritdoc
   */
  readAt(view: DataView, index: number, offset: number = 0): StructR<S> {
    return this.read(view, index * this.arrayStride + offset);
  }

  /**
   * @inheritdoc
   */
  writeAt(
    view: DataView,
    index: number,
    value: StructR<S>,
    offset: number = 0,
  ) {
    this.write(view, value, index * this.arrayStride + offset);
  }

  /**
   * This method is not implemented for structures.
   *
   * It is not possible to create a uniformly-typed, multi-element view into a structure.
   */
  view(_buffer: ArrayBuffer, _offset?: number, _length?: number): never {
    throw TypeError("Not implemented");
  }

  /**
   * @inheritdoc
   */
  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): StructV<S> {
    const effectiveOffset = index * this.arrayStride + offset;

    const obj = {} as StructV<S>;

    for (const field of this.#fields) {
      obj[field.name] = field.viewAt(buffer, 0, effectiveOffset);
    }

    return obj;
  }
}

/**
 * A given structure's field accessor.
 */
export class StructField<
  S extends NonEmpty<StructDescriptor<S>>,
  Key extends keyof S,
  F extends { index: number; type: T } = S[Key],
  T extends MemoryType<R, V, VF> = S[Key]["type"],
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF = MemoryTypeVF<T>,
> implements IStructField<S, Key, T, R, V, VF> {
  #parent: Struct<S>;
  #index: number;
  #name: Key;
  #type: T;
  #offset: number;

  constructor(
    parent: Struct<S>,
    fieldDescriptor: F,
    name: Key,
    offset: number,
  ) {
    this.#parent = parent;
    this.#index = fieldDescriptor.index;
    this.#type = fieldDescriptor.type;
    this.#name = name;
    this.#offset = offset;
  }

  /**
   * @returns The index of the field within the structure.
   */
  get index(): number {
    return this.#index;
  }

  /**
   * @returns The name of the field.
   */
  get name(): Key {
    return this.#name;
  }

  /**
   * @returns The type of the field.
   */
  get type(): T {
    return this.#type;
  }

  /**
   * @returns The byte size of the field, ignoring padding.
   */
  get byteSize(): number {
    return this.#type.byteSize;
  }

  /**
   * @returns The alignment of the field.
   */
  get alignment(): number {
    return this.#type.alignment;
  }

  /**
   * @returns The byte offset of the field within the structure.
   */
  get offset(): number {
    return this.#offset;
  }

  /**
   * @param view The view to read from.
   * @param [offset=0] The offset within the view to read from. Defaults to 0.
   * @returns The value of the field.
   */
  read(view: DataView, offset: number = 0): R {
    return this.#type.read(view, this.#offset + offset);
  }

  /**
   * @param view The view to write to.
   * @param value The value to write.
   * @param [offset=0] The offset within the view to write to. Defaults to 0.
   */
  write(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, this.#offset + offset);
  }

  /**
   * @param view The view to read from.
   * @param index The index of the structure to read from. The index is multiplied by the structure's stride.
   * @param [offset=0] The offset within the view to read from. Defaults to 0.
   * @returns The value of the field.
   */
  readAt(view: DataView, index: number, offset: number = 0): R {
    return this.#type.read(
      view,
      index * this.#parent.arrayStride + this.#offset + offset,
    );
  }

  /**
   * @param view The view to write to.
   * @param index The index of the structure to write to. The index is multiplied by the structure's stride.
   * @param value The value to write to the field.
   * @param [offset=0] The offset within the view to write to. Defaults to 0.
   */
  writeAt(view: DataView, index: number, value: R, offset: number = 0) {
    this.#type.write(
      view,
      value,
      index * this.#parent.arrayStride + this.#offset + offset,
    );
  }

  /**
   * @param buffer The buffer to create the view from.
   * @param index The index of the structure to create the view from. The index is multiplied by the structure's stride.
   * @param [offset=0] The offset within the buffer to create the view from. Defaults to 0.
   * @returns A view of the field.
   */
  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): V {
    return this.#type.viewAt(
      buffer,
      0,
      index * this.#parent.byteSize + this.#offset + offset,
    );
  }
}

/**
 * A user-defined object that describes the fields of a structure.
 *
 * @example
 * { field1: { index: 0, type: Int32 }, field2: { index: 1, type: Vec2F } }
 */
export type StructDescriptor<S> = {
  [K in keyof S]: S[K] extends { type: infer T } ? {
      index: number;
      type: T extends MemoryType<infer R, infer V, infer VF> ? T : never;
    }
    : never;
};

/**
 * Maps the fields of a structure to their respective field accessors.
 */
export type StructFieldsOf<S extends NonEmpty<StructDescriptor<S>>> = {
  [K in keyof S]: StructField<S, K>;
};

/**
 * A structure's object representation.
 */
export type StructR<S extends StructDescriptor<S>> = {
  [K in keyof S]: MemoryTypeR<S[K]["type"]>;
};

/**
 * A structure's view representation.
 */
export type StructV<S extends StructDescriptor<S>> = {
  [K in keyof S]: MemoryTypeV<S[K]["type"]>;
};

export interface IStruct<S extends NonEmpty<StructDescriptor<S>>>
  extends MemoryType<StructR<S>, StructV<S>, never> {
  readonly fields: IStructFieldsOf<S>;
}

export type IStructFieldsOf<S extends NonEmpty<StructDescriptor<S>>> = {
  [K in keyof S]: IStructField<S, K>;
};

export interface IStructField<
  S extends NonEmpty<StructDescriptor<S>>,
  Key extends keyof S,
  T extends MemoryType<R, V, VF> = S[Key]["type"],
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF = MemoryTypeVF<T>,
> {
  readonly index: number;
  readonly name: Key;
  readonly type: T;
  readonly byteSize: number;
  readonly alignment: number;
  readonly offset: number;

  read(view: DataView, offset?: number): R;
  write(view: DataView, value: R, offset?: number): void;
  readAt(view: DataView, index: number, offset?: number): R;
  writeAt(view: DataView, index: number, value: R, offset?: number): void;
  viewAt(buffer: ArrayBuffer, index: number, offset?: number): V;
}

function toCodeImpl<S extends NonEmpty<StructDescriptor<S>>>(
  struct: IStruct<S>,
  namespace: string,
  indentation: number = 0,
): string {
  const fields = typedObjectKeys(struct.fields).map((key) => {
    const field = struct.fields[key];
    const fieldType = field.type as MemoryType<unknown, unknown, unknown>;
    return `${String(field.name)}: { index: ${field.index}, type: ${
      fieldType.toCode(namespace, indentation + 2)
    } }`;
  });
  return [
    `new ${namespace}.Struct({`,
    ...fields.map((field) => `${" ".repeat(indentation + 2)}${field},`),
    `${" ".repeat(indentation)}})`,
  ].join("\n");
}

function toWgslImpl<S extends NonEmpty<StructDescriptor<S>>>(
  struct: IStruct<S>,
): string {
  const fields = typedObjectKeys(struct.fields).map((key) => {
    const field = struct.fields[key];
    return `${String(field.name)}: ${String(field.type)}`;
  });
  return `struct { ${fields.join(", ")} }`;
}

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
