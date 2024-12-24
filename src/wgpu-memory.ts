// Type annotations

const GPU_BOOL = "bool";
const GPU_I32 = "i32";
const GPU_U32 = "u32";
const GPU_F16 = "f16";
const GPU_F32 = "f32";
const GPU_VEC2 = "vec2";
const GPU_VEC3 = "vec3";
const GPU_VEC4 = "vec4";
const GPU_MAT2X2 = "mat2x2";
const GPU_MAT3X3 = "mat3x3";
const GPU_MAT4X4 = "mat4x4";
const GPU_ARRAY = "array";
const GPU_STRUCT = "struct";

const GPU_SCALAR_TYPES: ReadonlySet<GPUType> = new Set([
  GPU_BOOL,
  GPU_I32,
  GPU_U32,
  GPU_F16,
  GPU_F32,
]);

const GPU_NUMERIC_TYPES: ReadonlySet<GPUType> = new Set([
  GPU_I32,
  GPU_U32,
  GPU_F16,
  GPU_F32,
]);

type GPUBoolType = typeof GPU_BOOL;
type GPUIntegerType = typeof GPU_I32 | typeof GPU_U32;
type GPUFloatType = typeof GPU_F16 | typeof GPU_F32;
type GPUScalarType = GPUBoolType | GPUIntegerType | GPUFloatType;
type GPUVectorType = typeof GPU_VEC2 | typeof GPU_VEC3 | typeof GPU_VEC4;
type GPUMatrixType = typeof GPU_MAT2X2 | typeof GPU_MAT3X3 | typeof GPU_MAT4X4;
type GPUArrayType = typeof GPU_ARRAY;
type GPUStructureType = typeof GPU_STRUCT;
type GPUType =
  | GPUScalarType
  | GPUVectorType
  | GPUMatrixType
  | GPUArrayType
  | GPUStructureType;

interface IType<R, V> {
  type: GPUType;
  byteSize: number;
  alignment: number;
  read(view: DataView, offset?: number): R;
  write(view: DataView, value: R, offset?: number): void;
  readAt(view: DataView, index: number, offset?: number): R;
  writeAt(view: DataView, index: number, value: R, offset?: number): void;
  view(buffer: ArrayBuffer, offset?: number, length?: number): V;
}

type ITypeR<T> = T extends IType<infer R, infer V> ? R : never;

type ITypeV<T> = T extends IType<infer R, infer V> ? V : never;

type Tup2<T> = [T, T];
type Tup3<T> = [T, T, T];
type Tup4<T> = [T, T, T, T];

// Public helpers

export function allocate<T extends IType<R, V>, R = ITypeR<T>, V = ITypeV<T>>(
  type: T,
  count: number = 1,
): ArrayBuffer {
  return new ArrayBuffer(type.byteSize * count);
}

export function count<T extends IType<R, V>, R = ITypeR<T>, V = ITypeV<T>>(
  type: T,
  buffer: ArrayBufferLike | ArrayBufferView,
): number {
  return buffer.byteLength / type.byteSize;
}

// Array type

export class ArrayType<T extends IType<R, V>, R = ITypeR<T>, V = ITypeV<T>>
  implements IType<R[], V> {
  #type: T;
  #length: number;

  constructor(type: T, length: number) {
    this.#type = type;
    this.#length = length;
  }

  toString(): string {
    return `Array(${String(this.#type)}, ${this.#length})`;
  }

  get type(): typeof GPU_ARRAY {
    return GPU_ARRAY;
  }

  get byteSize(): number {
    return this.#length *
      wgslRoundUp(this.#type.alignment, this.#type.byteSize);
  }

  get alignment(): number {
    return this.#type.alignment;
  }

  read(view: DataView, offset: number = 0): R[] {
    const values = Array(this.#length);

    for (let i = 0; i < this.#length; i++) {
      values[i] = this.get(view, i, offset);
    }

    return values;
  }

  write(view: DataView, values: R[], offset: number = 0) {
    for (let i = 0; i < this.#length; i++) {
      this.set(view, i, values[i], offset);
    }
  }

  readAt(view: DataView, index: number, offset: number = 0): R[] {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(view: DataView, index: number, value: R[], offset: number = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): V {
    return this.#type.view(buffer, offset, length * this.#length);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {R}
   */
  get(view: DataView, index: number, offset: number = 0): R {
    return this.#type.readAt(view, index, offset);
  }

  set(view: DataView, index: number, value: R, offset: number = 0) {
    this.#type.writeAt(view, index, value, offset);
  }
}

// Struct type

type StructDescriptor<S> = {
  [K in keyof S]: S[K] extends { type: infer T } ? {
      index: number;
      type: T extends IType<infer R, infer V> ? T : never;
    }
    : never;
};

type StructFieldsOf<S extends StructDescriptor<S>> = {
  [K in keyof S]: StructField<S, K>;
};

type StructR<S extends StructDescriptor<S>> = {
  [K in keyof S]: ITypeR<S[K]["type"]>;
};

type StructV<S extends StructDescriptor<S>> = {
  [K in keyof S]: ITypeV<S[K]["type"]>;
};

export class Struct<S extends StructDescriptor<S>>
  implements IType<StructR<S>, StructV<S>> {
  #fields: Array<StructField<S, keyof S>>;
  #fieldsByName: StructFieldsOf<S>;
  #alignment: number;
  #size: number;

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
    this.#size = wgslRoundUp(alignment, offset);
  }

  toString(): string {
    return `Struct(${this.#fields.map(String).join(", ")})`;
  }

  get type(): typeof GPU_STRUCT {
    return GPU_STRUCT;
  }

  get fields(): StructFieldsOf<S> {
    return this.#fieldsByName;
  }

  get byteSize(): number {
    return this.#size;
  }

  get alignment(): number {
    return this.#alignment;
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
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(
    view: DataView,
    index: number,
    value: StructR<S>,
    offset: number = 0,
  ) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0): StructV<S> {
    const obj = {} as StructV<S>;

    for (const field of this.#fields) {
      obj[field.name] = field.view(buffer, offset);
    }

    return obj;
  }

  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): StructV<S> {
    return this.view(buffer, index * this.byteSize + offset);
  }
}

class StructField<
  S extends StructDescriptor<S>,
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
      index * this.#parent.byteSize + this.#offset + offset,
    );
  }

  writeAt(view: DataView, index: number, value: R, offset: number = 0) {
    this.#type.write(
      view,
      value,
      index * this.#parent.byteSize + this.#offset + offset,
    );
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): V {
    return this.#type.view(buffer, this.#offset + offset, length);
  }

  viewAt(buffer: ArrayBuffer, index: number, offset: number = 0): V {
    return this.#type.view(
      buffer,
      index * this.#parent.byteSize + this.#offset + offset,
    );
  }
}

// Matrix types

export class Mat2x2<T extends IType<R, V>, R = ITypeR<T>, V = ITypeV<T>>
  implements IType<Tup2<Tup2<R>>, V> {
  #type: T;

  constructor(type: T) {
    assert(
      GPU_NUMERIC_TYPES.has(type.type),
      "Matrix type must be a numeric type",
    );
    this.#type = type;
  }

  toString(): string {
    return `Mat2x2(${String(this.#type)})`;
  }

  get type(): typeof GPU_MAT2X2 {
    return GPU_MAT2X2;
  }

  get byteSize(): number {
    return this.#type.byteSize * 4;
  }

  get alignment(): number {
    return this.#type.alignment * 2;
  }

  read(view: DataView, offset: number = 0): Tup2<Tup2<R>> {
    return [
      [
        this.get(view, 0, 0, offset),
        this.get(view, 0, 1, offset),
      ],
      [
        this.get(view, 1, 0, offset),
        this.get(view, 1, 1, offset),
      ],
    ];
  }

  write(view: DataView, value: Tup2<Tup2<R>>, offset: number = 0) {
    this.set(view, 0, 0, value[0][0], offset);
    this.set(view, 0, 1, value[0][1], offset);
    this.set(view, 1, 0, value[1][0], offset);
    this.set(view, 1, 1, value[1][1], offset);
  }

  readAt(view: DataView, index: number, offset: number = 0): Tup2<Tup2<R>> {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(
    view: DataView,
    index: number,
    value: Tup2<Tup2<R>>,
    offset: number = 0,
  ) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): V {
    return this.#type.view(buffer, offset, length * 4);
  }

  index(row: number, column: number): number {
    return row * 2 + column;
  }

  offset(row: number, column: number): number {
    return this.index(row, column) * this.#type.byteSize;
  }

  get(view: DataView, row: number, column: number, offset: number = 0): R {
    return this.#type.read(view, offset + this.offset(row, column));
  }

  set(
    view: DataView,
    row: number,
    column: number,
    value: R,
    offset: number = 0,
  ) {
    this.#type.write(view, value, offset + this.offset(row, column));
  }
}

export class Mat3x3<T extends IType<R, V>, R = ITypeR<T>, V = ITypeV<T>>
  implements IType<Tup3<Tup3<R>>, V> {
  #type: T;

  constructor(type: T) {
    assert(
      GPU_NUMERIC_TYPES.has(type.type),
      "Matrix type must be a numeric type",
    );
    this.#type = type;
  }

  toString(): string {
    return `Mat3x3(${String(this.#type)})`;
  }

  get type(): typeof GPU_MAT3X3 {
    return GPU_MAT3X3;
  }

  get byteSize(): number {
    return this.#type.byteSize * 12;
  }

  get alignment(): number {
    return this.#type.alignment * 4;
  }

  read(view: DataView, offset: number = 0): Tup3<Tup3<R>> {
    return [
      [
        this.get(view, 0, 0, offset),
        this.get(view, 0, 1, offset),
        this.get(view, 0, 2, offset),
      ],
      [
        this.get(view, 1, 0, offset),
        this.get(view, 1, 1, offset),
        this.get(view, 1, 2, offset),
      ],
      [
        this.get(view, 2, 0, offset),
        this.get(view, 2, 1, offset),
        this.get(view, 2, 2, offset),
      ],
    ];
  }

  write(view: DataView, value: Tup3<Tup3<R>>, offset: number = 0) {
    this.set(view, 0, 0, value[0][0], offset);
    this.set(view, 0, 1, value[0][1], offset);
    this.set(view, 0, 2, value[0][2], offset);
    this.set(view, 1, 0, value[1][0], offset);
    this.set(view, 1, 1, value[1][1], offset);
    this.set(view, 1, 2, value[1][2], offset);
    this.set(view, 2, 0, value[2][0], offset);
    this.set(view, 2, 1, value[2][1], offset);
    this.set(view, 2, 2, value[2][2], offset);
  }

  readAt(view: DataView, index: number, offset: number = 0): Tup3<Tup3<R>> {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(
    view: DataView,
    index: number,
    value: Tup3<Tup3<R>>,
    offset: number = 0,
  ) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): V {
    return this.#type.view(buffer, offset, length * 9);
  }

  index(row: number, column: number): number {
    return row * 3 + column;
  }

  offset(row: number, column: number): number {
    return this.index(row, column) * this.#type.byteSize;
  }

  get(view: DataView, row: number, column: number, offset: number = 0): R {
    return this.#type.read(view, offset + this.offset(row, column));
  }

  set(
    view: DataView,
    row: number,
    column: number,
    value: R,
    offset: number = 0,
  ) {
    this.#type.write(view, value, offset + this.offset(row, column));
  }
}

export class Mat4x4<T extends IType<R, V>, R = ITypeR<T>, V = ITypeV<T>>
  implements IType<Tup4<Tup4<R>>, V> {
  #type: T;

  constructor(type: T) {
    assert(
      GPU_NUMERIC_TYPES.has(type.type),
      "Matrix type must be a numeric type",
    );
    this.#type = type;
  }

  toString(): string {
    return `Mat4x4(${String(this.#type)})`;
  }

  get type(): typeof GPU_MAT4X4 {
    return GPU_MAT4X4;
  }

  get byteSize(): number {
    return this.#type.byteSize * 16;
  }

  get alignment(): number {
    return this.#type.alignment * 4;
  }

  read(view: DataView, offset: number = 0): Tup4<Tup4<R>> {
    return [
      [
        this.get(view, 0, 0, offset),
        this.get(view, 0, 1, offset),
        this.get(view, 0, 2, offset),
        this.get(view, 0, 3, offset),
      ],
      [
        this.get(view, 1, 0, offset),
        this.get(view, 1, 1, offset),
        this.get(view, 1, 2, offset),
        this.get(view, 1, 3, offset),
      ],
      [
        this.get(view, 2, 0, offset),
        this.get(view, 2, 1, offset),
        this.get(view, 2, 2, offset),
        this.get(view, 2, 3, offset),
      ],
      [
        this.get(view, 3, 0, offset),
        this.get(view, 3, 1, offset),
        this.get(view, 3, 2, offset),
        this.get(view, 3, 3, offset),
      ],
    ];
  }

  write(view: DataView, value: Tup4<Tup4<R>>, offset: number = 0) {
    this.set(view, 0, 0, value[0][0], offset);
    this.set(view, 0, 1, value[0][1], offset);
    this.set(view, 0, 2, value[0][2], offset);
    this.set(view, 0, 3, value[0][3], offset);
    this.set(view, 1, 0, value[1][0], offset);
    this.set(view, 1, 1, value[1][1], offset);
    this.set(view, 1, 2, value[1][2], offset);
    this.set(view, 1, 3, value[1][3], offset);
    this.set(view, 2, 0, value[2][0], offset);
    this.set(view, 2, 1, value[2][1], offset);
    this.set(view, 2, 2, value[2][2], offset);
    this.set(view, 2, 3, value[2][3], offset);
    this.set(view, 3, 0, value[3][0], offset);
    this.set(view, 3, 1, value[3][1], offset);
    this.set(view, 3, 2, value[3][2], offset);
    this.set(view, 3, 3, value[3][3], offset);
  }

  readAt(view: DataView, index: number, offset: number = 0): Tup4<Tup4<R>> {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(
    view: DataView,
    index: number,
    value: Tup4<Tup4<R>>,
    offset: number = 0,
  ) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): V {
    return this.#type.view(buffer, offset, length * 16);
  }

  index(row: number, column: number): number {
    return row * 4 + column;
  }

  offset(row: number, column: number): number {
    return this.index(row, column) * this.#type.byteSize;
  }

  get(view: DataView, row: number, column: number, offset: number = 0): R {
    return this.#type.read(view, offset + this.offset(row, column));
  }

  set(
    view: DataView,
    row: number,
    column: number,
    value: R,
    offset: number = 0,
  ) {
    this.#type.write(view, value, offset + this.offset(row, column));
  }
}

// Vector types

export class Vec2<T extends IType<R, V>, R = ITypeR<T>, V = ITypeV<T>>
  implements IType<Tup2<R>, V> {
  #type: T;

  constructor(type: T) {
    assert(
      GPU_SCALAR_TYPES.has(type.type),
      "Vector type must be a scalar type",
    );
    this.#type = type;
  }

  toString(): string {
    return `Vec2(${String(this.#type)})`;
  }

  get type(): typeof GPU_VEC2 {
    return GPU_VEC2;
  }

  get byteSize(): number {
    return this.#type.byteSize * 2;
  }

  get alignment(): number {
    return this.#type.alignment * 2;
  }
  read(view: DataView, offset: number = 0): Tup2<R> {
    return [
      this.getX(view, offset),
      this.getY(view, offset),
    ];
  }

  write(view: DataView, value: Tup2<R>, offset: number = 0) {
    this.setX(view, value[0], offset);
    this.setY(view, value[1], offset);
  }

  readAt(view: DataView, index: number, offset: number = 0): Tup2<R> {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(view: DataView, index: number, value: Tup2<R>, offset: number = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): V {
    return this.#type.view(buffer, offset, length * 2);
  }

  get offsetX(): number {
    return 0;
  }

  get offsetY(): number {
    return this.#type.byteSize;
  }

  getX(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetX);
  }

  getY(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetY);
  }

  setX(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetX);
  }

  setY(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetY);
  }
}

export class Vec3<T extends IType<R, V>, R = ITypeR<T>, V = ITypeV<T>>
  implements IType<Tup3<R>, V> {
  #type: T;

  constructor(type: T) {
    assert(
      GPU_SCALAR_TYPES.has(type.type),
      "Vector type must be a scalar type",
    );
    this.#type = type;
  }

  toString(): string {
    return `Vec3(${String(this.#type)})`;
  }

  get type(): typeof GPU_VEC3 {
    return GPU_VEC3;
  }

  get byteSize(): number {
    return this.#type.byteSize * 3;
  }

  get alignment(): number {
    return nextPowerOfTwo(this.#type.alignment * 3);
  }

  read(view: DataView, offset: number = 0): Tup3<R> {
    return [
      this.getX(view, offset),
      this.getY(view, offset),
      this.getZ(view, offset),
    ];
  }

  write(view: DataView, value: Tup3<R>, offset: number = 0) {
    this.setX(view, value[0], offset);
    this.setY(view, value[1], offset);
    this.setZ(view, value[2], offset);
  }

  readAt(view: DataView, index: number, offset: number = 0): Tup3<R> {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(view: DataView, index: number, value: Tup3<R>, offset: number = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): V {
    return this.#type.view(buffer, offset, length * 3);
  }

  get offsetX(): number {
    return 0;
  }

  get offsetY(): number {
    return this.#type.byteSize;
  }

  get offsetZ(): number {
    return this.#type.byteSize * 2;
  }

  getX(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetX);
  }

  getY(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetY);
  }

  getZ(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetZ);
  }

  setX(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetX);
  }

  setY(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetY);
  }

  setZ(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetZ);
  }
}

export class Vec4<T extends IType<R, V>, R = ITypeR<T>, V = ITypeV<T>>
  implements IType<Tup4<R>, V> {
  /**
   * @type {T}
   */
  #type: T;

  /**
   * @param {T} type
   */
  constructor(type: T) {
    assert(
      GPU_SCALAR_TYPES.has(type.type),
      "Vector type must be a scalar type",
    );
    this.#type = type;
  }

  toString(): string {
    return `Vec4(${String(this.#type)})`;
  }

  get type(): typeof GPU_VEC4 {
    return GPU_VEC4;
  }

  get byteSize(): number {
    return this.#type.byteSize * 4;
  }

  get alignment(): number {
    return this.#type.alignment * 4;
  }

  get offsetX(): number {
    return 0;
  }

  get offsetY(): number {
    return this.#type.byteSize;
  }

  get offsetZ(): number {
    return this.#type.byteSize * 2;
  }

  get offsetW(): number {
    return this.#type.byteSize * 3;
  }

  read(view: DataView, offset: number = 0): Tup4<R> {
    return [
      this.getX(view, offset),
      this.getY(view, offset),
      this.getZ(view, offset),
      this.getW(view, offset),
    ];
  }

  write(view: DataView, value: Tup4<R>, offset: number = 0) {
    this.setX(view, value[0], offset);
    this.setY(view, value[1], offset);
    this.setZ(view, value[2], offset);
    this.setW(view, value[3], offset);
  }

  readAt(view: DataView, index: number, offset: number = 0): Tup4<R> {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(view: DataView, index: number, value: Tup4<R>, offset: number = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(buffer: ArrayBuffer, offset: number = 0, length: number = 1): V {
    return this.#type.view(buffer, offset, length * 4);
  }

  getX(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetX);
  }

  getY(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetY);
  }

  getZ(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetZ);
  }

  getW(view: DataView, offset: number = 0): R {
    return this.#type.read(view, offset + this.offsetW);
  }

  setX(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetX);
  }

  setY(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetY);
  }

  setZ(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetZ);
  }

  setW(view: DataView, value: R, offset: number = 0) {
    this.#type.write(view, value, offset + this.offsetW);
  }
}

// Primitive types

// /**
//  * @implements {IType<number, Float16Array>}
//  */
// class Float16Type {
//   /**
//    * @returns {string}
//    */
//   toString() {
//     return 'Float16';
//   }

//   /**
//    * @returns {typeof GPU_F16}
//    */
//   get type() {
//     return GPU_F16;
//   }

//   /**
//    * @returns {number}
//    */
//   get byteSize() {
//     return 2;
//   }

//   /**
//    * @returns {number}
//    */
//   get alignment() {
//     return 2;
//   }

//   /**
//    * @param {DataView} view
//    * @param {number} [offset=0]
//    * @returns {number}
//    */
//   read(view, offset = 0) {
//     return getFloat16(view, offset, true);
//   }

//   /**
//    * @param {DataView} view
//    * @param {number} value
//    * @param {number} [offset=0]
//    */
//   write(view, value, offset = 0) {
//     setFloat16(view, offset, value, true);
//   }

//   /**
//    * @param {DataView} view
//    * @param {number} index
//    * @param {number} [offset=0]
//    * @returns {number}
//    */
//   readAt(view, index, offset = 0) {
//     return this.read(view, index * this.byteSize + offset);
//   }

//   /**
//    * @param {DataView} view
//    * @param {number} index
//    * @param {number} value
//    * @param {number} [offset=0]
//    */
//   writeAt(view, index, value, offset = 0) {
//     this.write(view, value, index * this.byteSize + offset);
//   }

//   /**
//    * @param {ArrayBuffer} buffer
//    * @param {number} [offset=0]
//    * @param {number} [length=1]
//    * @returns {Float16Array}
//    */
//   view(buffer, offset = 0, length = 1) {
//     return new Float16Array(buffer, offset, length);
//   }
// }

class Float32Type implements IType<number, Float32Array> {
  toString(): string {
    return "Float32";
  }

  get type(): typeof GPU_F32 {
    return GPU_F32;
  }

  get byteSize(): number {
    return 4;
  }

  get alignment(): number {
    return 4;
  }

  read(view: DataView, offset: number = 0): number {
    return view.getFloat32(offset, true);
  }

  write(view: DataView, value: number, offset: number = 0) {
    view.setFloat32(offset, value, true);
  }

  readAt(view: DataView, index: number, offset: number = 0): number {
    return view.getFloat32(index * this.byteSize + offset, true);
  }

  writeAt(view: DataView, index: number, value: number, offset: number = 0) {
    view.setFloat32(index * this.byteSize + offset, value, true);
  }

  view(
    buffer: ArrayBuffer,
    offset: number = 0,
    length: number = 1,
  ): Float32Array {
    return new Float32Array(buffer, offset, length);
  }
}

class Uint32Type implements IType<number, Uint32Array> {
  toString(): string {
    return "Uint32";
  }

  get type(): typeof GPU_U32 {
    return GPU_U32;
  }

  get byteSize(): number {
    return 4;
  }

  get alignment(): number {
    return 4;
  }

  read(view: DataView, offset: number = 0): number {
    return view.getUint32(offset, true);
  }

  write(view: DataView, value: number, offset: number = 0) {
    view.setUint32(offset, value, true);
  }

  readAt(view: DataView, index: number, offset: number = 0): number {
    return view.getUint32(index * this.byteSize + offset, true);
  }

  writeAt(view: DataView, index: number, value: number, offset: number = 0) {
    view.setUint32(index * this.byteSize + offset, value, true);
  }

  view(
    buffer: ArrayBuffer,
    offset: number = 0,
    length: number = 1,
  ): Uint32Array {
    return new Uint32Array(buffer, offset, length);
  }
}

class Int32Type implements IType<number, Int32Array> {
  toString(): string {
    return "Int32";
  }

  get type(): typeof GPU_I32 {
    return GPU_I32;
  }

  get byteSize(): number {
    return 4;
  }

  get alignment(): number {
    return 4;
  }

  read(view: DataView, offset: number = 0): number {
    return view.getInt32(offset, true);
  }

  write(view: DataView, value: number, offset: number = 0) {
    view.setInt32(offset, value, true);
  }

  readAt(view: DataView, index: number, offset: number = 0): number {
    return view.getInt32(index * this.byteSize + offset, true);
  }

  writeAt(view: DataView, index: number, value: number, offset: number = 0) {
    view.setInt32(index * this.byteSize + offset, value, true);
  }

  view(
    buffer: ArrayBuffer,
    offset: number = 0,
    length: number = 1,
  ): Int32Array {
    return new Int32Array(buffer, offset, length);
  }
}

class BoolType implements IType<boolean, Uint32Array> {
  toString(): string {
    return "Bool";
  }

  get type(): typeof GPU_BOOL {
    return GPU_BOOL;
  }

  /**
   * @see https://gpuweb.github.io/gpuweb/wgsl/#why-is-bool-4-bytes
   */
  get byteSize(): number {
    return 4;
  }

  /**
   * @see https://gpuweb.github.io/gpuweb/wgsl/#why-is-bool-4-bytes
   */
  get alignment(): number {
    return 4;
  }

  read(view: DataView, offset: number = 0): boolean {
    return !!view.getInt32(offset, true);
  }

  write(view: DataView, value: boolean, offset: number = 0) {
    view.setInt32(offset, value ? 1 : 0, true);
  }

  readAt(view: DataView, index: number, offset: number = 0): boolean {
    return this.read(view, index * this.byteSize + offset);
  }

  writeAt(view: DataView, index: number, value: boolean, offset: number = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  view(
    buffer: ArrayBuffer,
    offset: number = 0,
    length: number = 1,
  ): Uint32Array {
    return new Uint32Array(buffer, offset, length);
  }
}

// Type helpers

export const Bool: BoolType = new BoolType();

// export const Float16 = new Float16Type();
export const Float32: Float32Type = new Float32Type();
export const Uint32: Uint32Type = new Uint32Type();
export const Int32: Int32Type = new Int32Type();

export const Vec2B: Vec2<BoolType> = new Vec2(Bool);
export const Vec3B: Vec3<BoolType> = new Vec3(Bool);
export const Vec4B: Vec4<BoolType> = new Vec4(Bool);

// export const Vec2H = new Vec2(Float16);
// export const Vec3H = new Vec3(Float16);
// export const Vec4H = new Vec4(Float16);
// export const Mat2x2H = new Mat2x2(Float16);
// export const Mat3x3H = new Mat3x3(Float16);
// export const Mat4x4H = new Mat4x4(Float16);

export const Vec2F: Vec2<Float32Type> = new Vec2(Float32);
export const Vec3F: Vec3<Float32Type> = new Vec3(Float32);
export const Vec4F: Vec4<Float32Type> = new Vec4(Float32);
export const Mat2x2F: Mat2x2<Float32Type> = new Mat2x2(Float32);
export const Mat3x3F: Mat3x3<Float32Type> = new Mat3x3(Float32);
export const Mat4x4F: Mat4x4<Float32Type> = new Mat4x4(Float32);

export const Vec2U: Vec2<Uint32Type> = new Vec2(Uint32);
export const Vec3U: Vec3<Uint32Type> = new Vec3(Uint32);
export const Vec4U: Vec4<Uint32Type> = new Vec4(Uint32);
export const Mat2x2U: Mat2x2<Uint32Type> = new Mat2x2(Uint32);
export const Mat3x3U: Mat3x3<Uint32Type> = new Mat3x3(Uint32);
export const Mat4x4U: Mat4x4<Uint32Type> = new Mat4x4(Uint32);

export const Vec2I: Vec2<Int32Type> = new Vec2(Int32);
export const Vec3I: Vec3<Int32Type> = new Vec3(Int32);
export const Vec4I: Vec4<Int32Type> = new Vec4(Int32);
export const Mat2x2I: Mat2x2<Int32Type> = new Mat2x2(Int32);
export const Mat3x3I: Mat3x3<Int32Type> = new Mat3x3(Int32);
export const Mat4x4I: Mat4x4<Int32Type> = new Mat4x4(Int32);

// Private helpers

function nextPowerOfTwo(value: number): number {
  return 2 ** Math.ceil(Math.log2(value));
}

/**
 * @see https://gpuweb.github.io/gpuweb/wgsl/#roundup
 */
function wgslRoundUp(k: number, n: number): number {
  return Math.ceil(n / k) * k;
}

function typedObjectKeys<T extends Record<string, unknown>>(
  obj: T,
): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

function assert(condition: boolean, message: string = "") {
  if (!condition) {
    throw Error(message);
  }
}
