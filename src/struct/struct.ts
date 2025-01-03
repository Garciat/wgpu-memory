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
import type {
  StructDescriptor,
  StructField,
  StructFieldsOf,
  StructR,
  StructType,
  StructV,
} from "../types.ts";
import { structToCode, structToString } from "./string.ts";

/**
 * A constructor for structure types.
 *
 * @see https://gpuweb.github.io/gpuweb/wgsl/#struct-types
 */
export class StructTypeImpl<S extends NonEmpty<StructDescriptor<S>>>
  implements StructType<S> {
  #fields: ReadonlyArray<StructFieldImpl<S, keyof S>>;
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

    const fields = Array(Object.keys(descriptor).length);
    const fieldsByName = {} as {
      [K in keyof S]: StructField<S, K>;
    };

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

      const field = new StructFieldImpl(this, fieldDescriptor, name, offset);

      fields[fieldDescriptor.index] = field;
      fieldsByName[name] = field;

      offset += fieldType.byteSize;
      alignment = Math.max(alignment, fieldType.alignment);
    }

    this.#fields = Object.freeze(fields);
    this.#fieldsByName = Object.freeze(fieldsByName);
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
  get fieldList(): ReadonlyArray<StructFieldImpl<S, keyof S>> {
    return this.#fields;
  }

  /**
   * @inheritdoc
   */
  toString(): string {
    return structToString(this);
  }

  /**
   * @inheritdoc
   */
  toCode(namespace: string, indentation: number = 0): string {
    return structToCode(this, namespace, indentation);
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
export class StructFieldImpl<
  S extends NonEmpty<StructDescriptor<S>>,
  Key extends keyof S,
  F extends { index: number; type: T } = S[Key],
  T extends MemoryType<R, V, VF> = S[Key]["type"],
  R = MemoryTypeR<T>,
  V = MemoryTypeV<T>,
  VF = MemoryTypeVF<T>,
> implements StructField<S, Key, T, R, V, VF> {
  #parent: StructTypeImpl<S>;
  #index: number;
  #name: Key;
  #type: T;
  #offset: number;

  constructor(
    parent: StructTypeImpl<S>,
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
