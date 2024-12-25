import { GPU_STRUCT, type IType, type ITypeR, type ITypeV } from "../types.ts";
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
  implements IType<StructR<S>, StructV<S>> {
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
      const fieldType = fieldDescriptor.type as IType<unknown, unknown>;

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

  toString(): string {
    return `struct { ${this.#fields.map(String).join(", ")} }`;
  }

  get type(): typeof GPU_STRUCT {
    return GPU_STRUCT;
  }

  get fields(): StructFieldsOf<S> {
    return this.#fieldsByName;
  }

  get byteSize(): number {
    return this.#byteSize;
  }

  get alignment(): number {
    return this.#alignment;
  }

  get arrayStride(): number {
    return this.#arrayStride;
  }

  read(view: DataView, offset: number = 0): StructR<S> {
    const obj = {} as StructR<S>;

    for (const field of this.#fields) {
      obj[field.name] = field.read(view, offset);
    }

    return obj;
  }

  write(view: DataView, values: StructR<S>, offset: number = 0) {
    for (const name of typedObjectKeys(this.#fieldsByName)) {
      const field = this.#fieldsByName[name];
      field.write(view, values[name], offset);
    }
  }

  readAt(view: DataView, index: number, offset: number = 0): StructR<S> {
    return this.read(view, index * this.arrayStride + offset);
  }

  writeAt(
    view: DataView,
    index: number,
    value: StructR<S>,
    offset: number = 0,
  ) {
    this.write(view, value, index * this.arrayStride + offset);
  }

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
 * A view into a field of a structure.
 */
class StructField<
  S extends NonEmpty<StructDescriptor<S>>,
  Key extends keyof S,
  F extends { index: number; type: T } = S[Key],
  T extends IType<R, V> = S[Key]["type"],
  R = ITypeR<T>,
  V = ITypeV<T>,
> {
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

  toString(): string {
    return `${String(this.#name)}: ${String(this.#type)}`;
  }

  get name(): Key {
    return this.#name;
  }

  get byteSize(): number {
    return this.#type.byteSize;
  }

  get alignment(): number {
    return this.#type.alignment;
  }

  get offset(): number {
    return this.#offset;
  }

  read(view: DataView, offset: number = 0): R {
    return this.#type.read(view, this.#offset + offset);
  }

  write(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, this.#offset + offset);
  }

  readAt(view: DataView, index: number, offset: number = 0): R {
    return this.#type.read(
      view,
      index * this.#parent.arrayStride + this.#offset + offset,
    );
  }

  writeAt(view: DataView, index: number, value: R, offset: number = 0) {
    this.#type.write(
      view,
      value,
      index * this.#parent.arrayStride + this.#offset + offset,
    );
  }

  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): V {
    return this.#type.viewAt(
      buffer,
      0,
      index * this.#parent.byteSize + this.#offset + offset,
    );
  }
}

type StructDescriptor<S> = {
  [K in keyof S]: S[K] extends { type: infer T } ? {
      index: number;
      type: T extends IType<infer R, infer V> ? T : never;
    }
    : never;
};

type StructFieldsOf<S extends NonEmpty<StructDescriptor<S>>> = {
  [K in keyof S]: StructField<S, K>;
};

type StructR<S extends StructDescriptor<S>> = {
  [K in keyof S]: ITypeR<S[K]["type"]>;
};

type StructV<S extends StructDescriptor<S>> = {
  [K in keyof S]: ITypeV<S[K]["type"]>;
};
