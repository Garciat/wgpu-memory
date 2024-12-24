// Type annotations

const GPU_BOOL = 'bool';
const GPU_I32 = 'i32';
const GPU_U32 = 'u32';
const GPU_F16 = 'f16';
const GPU_F32 = 'f32';
const GPU_VEC2 = 'vec2';
const GPU_VEC3 = 'vec3';
const GPU_VEC4 = 'vec4';
const GPU_MAT2X2 = 'mat2x2';
const GPU_MAT3X3 = 'mat3x3';
const GPU_MAT4X4 = 'mat4x4';
const GPU_ARRAY = 'array';
const GPU_STRUCT = 'struct';

/**
 * @type {ReadonlySet<GPUType>}
 */
const GPU_SCALAR_TYPES = new Set([GPU_BOOL, GPU_I32, GPU_U32, GPU_F16, GPU_F32]);

/**
 * @type {ReadonlySet<GPUType>}
 */
const GPU_NUMERIC_TYPES = new Set([GPU_I32, GPU_U32, GPU_F16, GPU_F32]);

/**
 * @typedef {typeof GPU_BOOL} GPUBoolType
 */

/**
 * @typedef {typeof GPU_I32 | typeof GPU_U32} GPUIntegerType
 */

/**
 * @typedef {typeof GPU_F16 | typeof GPU_F32} GPUFloatType
 */

/**
 * @typedef {GPUBoolType|GPUIntegerType|GPUFloatType} GPUScalarType
 */

/**
 * @typedef {typeof GPU_VEC2 | typeof GPU_VEC3 | typeof GPU_VEC4} GPUVectorType
 */

/**
 * @typedef {typeof GPU_MAT2X2 | typeof GPU_MAT3X3 | typeof GPU_MAT4X4} GPUMatrixType
 */

/**
 * @typedef {typeof GPU_ARRAY} GPUArrayType
 */

/**
 * @typedef {typeof GPU_STRUCT} GPUStructureType
 */

/**
 * @typedef {GPUScalarType|GPUVectorType|GPUMatrixType|GPUArrayType|GPUStructureType} GPUType
 */

/**
 * @template R
 * @template V
 * @typedef {object} IType
 * @property {GPUType} type
 * @property {number} byteSize
 * @property {number} alignment
 * @property {(view: DataView, offset?: number) => R} read
 * @property {(view: DataView, value: R, offset?: number) => void} write
 * @property {(view: DataView, index: number, offset?: number) => R} readAt
 * @property {(view: DataView, index: number, value: R, offset?: number) => void} writeAt
 * @property {(buffer: ArrayBuffer, offset?: number, length?: number) => V} view
 */

/**
 * @template T
 * @typedef {T extends IType<infer R, infer V> ? R : never} ITypeR
 */

/**
 * @template T
 * @typedef {T extends IType<infer R, infer V> ? V : never} ITypeV
 */

/**
 * @template T
 * @typedef {[T, T]} Tup2
 */

/**
 * @template T
 * @typedef {[T, T, T]} Tup3
 */

/**
 * @template T
 * @typedef {[T, T, T, T]} Tup4
 */

// Public helpers

/**
 * @template {IType<R, V>} T
 * @template [R=ITypeR<T>]
 * @template [V=ITypeV<T>]
 * @param {T} type
 * @param {number} [count=1]
 * @returns {ArrayBuffer}
 */
export function allocate(type, count = 1) {
  return new ArrayBuffer(type.byteSize * count);
}

/**
 * @template {IType<R, V>} T
 * @template [R=ITypeR<T>]
 * @template [V=ITypeV<T>]
 * @param {T} type
 * @param {ArrayBufferLike|ArrayBufferView} buffer
 * @returns {number}
 */
export function count(type, buffer) {
  return buffer.byteLength / type.byteSize;
}

// Array type

/**
 * @template {IType<R, V>} T
 * @template [R=ITypeR<T>]
 * @template [V=ITypeV<T>]
 * @implements {IType<R[], V>}
 */
export class ArrayType {
  /**
   * @type {IType<R, V>}
   */
  #type;

  /**
   * @type {number}
   */
  #length;

  /**
   * @param {T} type
   * @param {number} length
   */
  constructor(type, length) {
    this.#type = type;
    this.#length = length;
  }

  /**
   * @returns {string}
   */
  toString() {
    return `Array(${String(this.#type)}, ${this.#length})`;
  }

  /**
   * @returns {typeof GPU_ARRAY}
   */
  get type() {
    return GPU_ARRAY;
  }

  /**
   * @returns {number}
   */
  get byteSize() {
    return this.#length * wgslRoundUp(this.#type.alignment, this.#type.byteSize);
  }

  /**
   * @returns {number}
   */
  get alignment() {
    return this.#type.alignment;
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {R[]}
   */
  read(view, offset = 0) {
    const values = Array(this.#length);

    for (let i = 0; i < this.#length; i++) {
      values[i] = this.get(view, i, offset);
    }

    return values;
  }

  /**
   * @param {DataView} view
   * @param {R[]} values
   * @param {number} [offset=0]
   */
  write(view, values, offset = 0) {
    for (let i = 0; i < this.#length; i++) {
      this.set(view, i, values[i], offset);
    }
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {R[]}
   */
  readAt(view, index, offset = 0) {
    return this.read(view, index * this.byteSize + offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {R[]} value
   * @param {number} [offset=0]
   */
  writeAt(view, index, value, offset = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} [offset=0]
   * @param {number} [length=1]
   * @returns {V}
   */
  view(buffer, offset = 0, length = 1) {
    return this.#type.view(buffer, offset, length * this.#length);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {R}
   */
  get(view, index, offset = 0) {
    return this.#type.readAt(view, index, offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {R} value
   * @param {number} [offset=0]
   */
  set(view, index, value, offset = 0) {
    this.#type.writeAt(view, index, value, offset);
  }
}

// Struct type

/**
 * @template S
 * @typedef {{
 *   [K in keyof S]:
 *     S[K] extends {type: infer T}
 *       ? {
 *         index: number,
 *         type: T extends IType<infer R, infer V> ? T : never,
 *       }
 *       : never
 * }} StructDescriptor
 * @see https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
 */

/**
 * @template {StructDescriptor<S>} S
 * @typedef {{[K in keyof S]: StructField<S, K>}} StructFieldsOf
 */

/**
 * @template {StructDescriptor<S>} S
 * @typedef {{[K in keyof S]: ITypeR<S[K]['type']>}} StructR
 */

/**
 * @template {StructDescriptor<S>} S
 * @typedef {{[K in keyof S]: ITypeV<S[K]['type']>}} StructV
 */

/**
 * @template {StructDescriptor<S>} S
 * @implements {IType<StructR<S>, StructV<S>>}
 */
export class Struct {
  /**
   * @type {Array<StructField<S, keyof S>>} fields
   */
  #fields;

  /**
   * @type {StructFieldsOf<S>} fieldsByName
   */
  #fieldsByName;

  /**
   * @type {number}
   */
  #alignment;

  /**
   * @type {number} size
   */
  #size;

  /**
   * @param {S} descriptor
   * @see https://gpuweb.github.io/gpuweb/wgsl/#structure-member-layout
   */
  constructor(descriptor) {
    let offset = 0;
    let alignment = 0;

    this.#fields = Array(Object.keys(descriptor).length);
    this.#fieldsByName = /** @type {StructFieldsOf<S>} */ ({});

    for (const name of typedObjectKeys(descriptor)) {
      const fieldDescriptor = descriptor[name];
      const fieldType = /** @type {IType<unknown, unknown>} */ (fieldDescriptor.type);

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

  /**
   * @returns {string}
   */
  toString() {
    return `Struct(${this.#fields.map(String).join(', ')})`;
  }

  /**
   * @returns {typeof GPU_STRUCT}
   */
  get type() {
    return GPU_STRUCT;
  }

  /**
   * @returns {StructFieldsOf<S>}
   */
  get fields() {
    return this.#fieldsByName;
  }

  /**
   * @returns {number}
   */
  get byteSize() {
    return this.#size;
  }

  /**
   * @returns {number}
   */
  get alignment() {
    return this.#alignment;
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {StructR<S>}
   */
  read(view, offset = 0) {
    const obj = /** @type {StructR<S>} */ ({});

    for (const field of this.#fields) {
      obj[field.name] = field.read(view, offset);
    }

    return obj;
  }

  /**
   * @param {DataView} view
   * @param {StructR<S>} values
   * @param {number} [offset=0]
   */
  write(view, values, offset = 0) {
    for (const name of typedObjectKeys(this.#fieldsByName)) {
      const field = this.#fieldsByName[name];
      field.write(view, values[name], offset);
    }
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {StructR<S>}
   */
  readAt(view, index, offset = 0) {
    return this.read(view, index * this.byteSize + offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {StructR<S>} value
   * @param {number} [offset=0]
   */
  writeAt(view, index, value, offset = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} [offset=0]
   * @param {number} [length=1]
   * @returns {StructV<S>}
   */
  view(buffer, offset = 0) {
    const obj = /** @type {StructV<S>} */ ({});

    for (const field of this.#fields) {
      obj[field.name] = field.view(buffer, offset);
    }

    return obj;
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {StructV<S>}
   */
  viewAt(buffer, index, offset = 0) {
    return this.view(buffer, index * this.byteSize + offset);
  }
}

/**
 * @template {StructDescriptor<S>} S
 * @template {keyof S} Key
 * @template {{index: number, type: T}} [F=S[Key]]
 * @template {IType<R, V>} [T=S[Key]['type']]
 * @template [R=ITypeR<T>]
 * @template [V=ITypeV<T>]
 */
class StructField {
  /**
   * @type {Struct<S>} parent
   */
  #parent;

  /**
   * @type {number} index
   */
  #index;

  /**
   * @type {Key} name
   */
  #name;

  /**
   * @type {T} type
   */
  #type;

  /**
   * @type {number} offset
   */
  #offset;

  /**
   * @param {Struct<S>} parent
   * @param {F} fieldDescriptor
   * @param {Key} name
   * @param {number} offset
   */
  constructor(parent, fieldDescriptor, name, offset) {
    this.#parent = parent;
    this.#index = fieldDescriptor.index;
    this.#type = fieldDescriptor.type;
    this.#name = name;
    this.#offset = offset;
  }

  toString() {
    return `${String(this.#name)}: ${String(this.#type)}`;
  }

  get name() {
    return this.#name;
  }

  get byteSize() {
    return this.#type.byteSize;
  }

  get alignment() {
    return this.#type.alignment;
  }

  get offset() {
    return this.#offset;
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   */
  read(view, offset = 0) {
    return this.#type.read(view, this.#offset + offset);
  }

  /**
   * @param {DataView} view
   * @param {ITypeR<F['type']>} value
   * @param {number} [offset=0]
   */
  write(view, value, offset = 0) {
    this.#type.write(view, value, this.#offset + offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {R}
   */
  readAt(view, index, offset = 0) {
    return this.#type.read(view, index * this.#parent.byteSize + this.#offset + offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {ITypeR<F['type']>} value
   * @param {number} [offset=0]
   */
  writeAt(view, index, value, offset = 0) {
    this.#type.write(view, value, index * this.#parent.byteSize + this.#offset + offset);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} [offset=0]
   * @param {number} [length=1]
   * @returns {V}
   */
  view(buffer, offset = 0, length = 1) {
    return this.#type.view(buffer, this.#offset + offset, length);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {V}
   */
  viewAt(buffer, index, offset = 0) {
    return this.#type.view(buffer, index * this.#parent.byteSize + this.#offset + offset);
  }
}

// Matrix types

/**
 * @template {IType<R, V>} T
 * @template [R=ITypeR<T>]
 * @template [V=ITypeV<T>]
 * @implements {IType<Tup2<Tup2<R>>, V>}
 */
export class Mat2x2 {
  /**
   * @type {T}
   */
  #type;

  /**
   * @param {T} type
   */
  constructor(type) {
    assert(GPU_NUMERIC_TYPES.has(type.type), 'Matrix type must be a numeric type');
    this.#type = type;
  }

  toString() {
    return `Mat2x2(${String(this.#type)})`;
  }

  /**
   * @returns {typeof GPU_MAT2X2}
   */
  get type() {
    return GPU_MAT2X2;
  }

  get byteSize() {
    return this.#type.byteSize * 4;
  }

  get alignment() {
    return this.#type.alignment * 2;
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {Tup2<Tup2<R>>}
   */
  read(view, offset = 0) {
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

  /**
   * @param {DataView} view
   * @param {Tup2<Tup2<R>>} value
   * @param {number} [offset=0]
   */
  write(view, value, offset = 0) {
    this.set(view, 0, 0, value[0][0], offset);
    this.set(view, 0, 1, value[0][1], offset);
    this.set(view, 1, 0, value[1][0], offset);
    this.set(view, 1, 1, value[1][1], offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {Tup2<Tup2<R>>}
   */
  readAt(view, index, offset = 0) {
    return this.read(view, index * this.byteSize + offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {Tup2<Tup2<R>>} value
   * @param {number} [offset=0]
   */
  writeAt(view, index, value, offset = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} [offset=0]
   * @param {number} [length=1]
   * @returns {V}
   */
  view(buffer, offset = 0, length = 1) {
    return this.#type.view(buffer, offset, length * 4);
  }

  /**
   * @param {number} row
   * @param {number} column
   * @returns {number}
   */
  index(row, column) {
    return row * 2 + column;
  }

  /**
   * @param {number} row
   * @param {number} column
   * @returns {number}
   */
  offset(row, column) {
    return this.index(row, column) * this.#type.byteSize;
  }

  /**
   * @param {DataView} view
   * @param {number} row
   * @param {number} column
   * @param {number} [offset=0]
   * @returns {R}
   */
  get(view, row, column, offset = 0) {
    return this.#type.read(view, offset + this.offset(row, column));
  }

  /**
   * @param {DataView} view
   * @param {number} row
   * @param {number} column
   * @param {R} value
   * @param {number} [offset=0]
   */
  set(view, row, column, value, offset = 0) {
    this.#type.write(view, value, offset + this.offset(row, column));
  }
}

/**
 * @template {IType<R, V>} T
 * @template [R=ITypeR<T>]
 * @template [V=ITypeV<T>]
 * @implements {IType<Tup3<Tup3<R>>, V>}
 */
export class Mat3x3 {
  /**
   * @type {T}
   */
  #type;

  /**
   * @param {T} type
   */
  constructor(type) {
    assert(GPU_NUMERIC_TYPES.has(type.type), 'Matrix type must be a numeric type');
    this.#type = type;
  }

  toString() {
    return `Mat3x3(${String(this.#type)})`;
  }

  /**
   * @returns {typeof GPU_MAT3X3}
   */
  get type() {
    return GPU_MAT3X3;
  }

  get byteSize() {
    return this.#type.byteSize * 12;
  }

  get alignment() {
    return this.#type.alignment * 4;
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {Tup3<Tup3<R>>}
   */
  read(view, offset = 0) {
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

  /**
   * @param {DataView} view
   * @param {Tup3<Tup3<R>>} value
   * @param {number} [offset=0]
   */
  write(view, value, offset = 0) {
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

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {Tup3<Tup3<R>>}
   */
  readAt(view, index, offset = 0) {
    return this.read(view, index * this.byteSize + offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {Tup3<Tup3<R>>} value
   * @param {number} [offset=0]
   */
  writeAt(view, index, value, offset = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} [offset=0]
   * @param {number} [length=1]
   * @returns {V}
   */
  view(buffer, offset = 0, length = 1) {
    return this.#type.view(buffer, offset, length * 9);
  }

  /**
   * @param {number} row
   * @param {number} column
   * @returns {number}
   */
  index(row, column) {
    return row * 3 + column;
  }

  /**
   * @param {number} row
   * @param {number} column
   * @returns {number}
   */
  offset(row, column) {
    return this.index(row, column) * this.#type.byteSize;
  }

  /**
   * @param {DataView} view
   * @param {number} row
   * @param {number} column
   * @param {number} [offset=0]
   * @returns {R}
   */
  get(view, row, column, offset = 0) {
    return this.#type.read(view, offset + this.offset(row, column));
  }

  /**
   * @param {DataView} view
   * @param {number} row
   * @param {number} column
   * @param {R} value
   * @param {number} [offset=0]
   */
  set(view, row, column, value, offset = 0) {
    this.#type.write(view, value, offset + this.offset(row, column));
  }
}

/**
 * @template {IType<R, V>} T
 * @template [R=ITypeR<T>]
 * @template [V=ITypeV<T>]
 * @implements {IType<Tup4<Tup4<R>>, V>}
 */
export class Mat4x4 {
  /**
   * @type {T}
   */
  #type;

  /**
   * @param {T} type
   */
  constructor(type) {
    assert(GPU_NUMERIC_TYPES.has(type.type), 'Matrix type must be a numeric type');
    this.#type = type;
  }

  toString() {
    return `Mat4x4(${String(this.#type)})`;
  }

  /**
   * @returns {typeof GPU_MAT4X4}
   */
  get type() {
    return GPU_MAT4X4;
  }

  get byteSize() {
    return this.#type.byteSize * 16;
  }

  get alignment() {
    return this.#type.alignment * 4;
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {Tup4<Tup4<R>>}
   */
  read(view, offset = 0) {
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

  /**
   * @param {DataView} view
   * @param {Tup4<Tup4<R>>} value
   * @param {number} [offset=0]
   */
  write(view, value, offset = 0) {
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

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {Tup4<Tup4<R>>}
   */
  readAt(view, index, offset = 0) {
    return this.read(view, index * this.byteSize + offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {Tup4<Tup4<R>>} value
   * @param {number} [offset=0]
   */
  writeAt(view, index, value, offset = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} [offset=0]
   * @param {number} [length=1]
   * @returns {V}
   */
  view(buffer, offset = 0, length = 1) {
    return this.#type.view(buffer, offset, length * 16);
  }

  /**
   * @param {number} row
   * @param {number} column
   * @returns {number}
   */
  index(row, column) {
    return row * 4 + column;
  }

  /**
   * @param {number} row
   * @param {number} column
   * @returns {number}
   */
  offset(row, column) {
    return this.index(row, column) * this.#type.byteSize;
  }

  /**
   * @param {DataView} view
   * @param {number} row
   * @param {number} column
   * @param {number} [offset=0]
   * @returns {R}
   */
  get(view, row, column, offset = 0) {
    return this.#type.read(view, offset + this.offset(row, column));
  }

  /**
   * @param {DataView} view
   * @param {number} row
   * @param {number} column
   * @param {R} value
   * @param {number} [offset=0]
   */
  set(view, row, column, value, offset = 0) {
    this.#type.write(view, value, offset + this.offset(row, column));
  }
}

// Vector types

/**
 * @template {IType<R, V>} T
 * @template [R=ITypeR<T>]
 * @template [V=ITypeV<T>]
 * @implements {IType<Tup2<R>, V>}
 */
export class Vec2 {
  /**
   * @type {T}
   */
  #type;

  /**
   * @param {T} type
   */
  constructor(type) {
    assert(GPU_SCALAR_TYPES.has(type.type), 'Vector type must be a scalar type');
    this.#type = type;
  }

  toString() {
    return `Vec2(${String(this.#type)})`;
  }

  /**
   * @returns {typeof GPU_VEC2}
   */
  get type() {
    return GPU_VEC2;
  }

  get byteSize() {
    return this.#type.byteSize * 2;
  }

  get alignment() {
    return this.#type.alignment * 2;
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {Tup2<R>}
   */
  read(view, offset = 0) {
    return [
      this.getX(view, offset),
      this.getY(view, offset),
    ];
  }

  /**
   * @param {DataView} view
   * @param {Tup2<R>} value
   * @param {number} [offset=0]
   */
  write(view, value, offset = 0) {
    this.setX(view, value[0], offset);
    this.setY(view, value[1], offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {Tup2<R>}
   */
  readAt(view, index, offset = 0) {
    return this.read(view, index * this.byteSize + offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {Tup2<R>} value
   * @param {number} [offset=0]
   */
  writeAt(view, index, value, offset = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} [offset=0]
   * @param {number} [length=1]
   * @returns {V}
   */
  view(buffer, offset = 0, length = 1) {
    return this.#type.view(buffer, offset, length * 2);
  }

  get offsetX() {
    return 0;
  }

  get offsetY() {
    return this.#type.byteSize;
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {R}
   */
  getX(view, offset = 0) {
    return this.#type.read(view, offset + this.offsetX);
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {R}
   */
  getY(view, offset = 0) {
    return this.#type.read(view, offset + this.offsetY);
  }

  /**
   * @param {DataView} view
   * @param {R} value
   * @param {number} [offset=0]
   */
  setX(view, value, offset = 0) {
    this.#type.write(view, value, offset + this.offsetX);
  }

  /**
   * @param {DataView} view
   * @param {R} value
   * @param {number} [offset=0]
   */
  setY(view, value, offset = 0) {
    this.#type.write(view, value, offset + this.offsetY);
  }
}

/**
 * @template {IType<R, V>} T
 * @template [R=ITypeR<T>]
 * @template [V=ITypeV<T>]
 * @implements {IType<Tup3<R>, V>}
 */
export class Vec3 {
  /**
   * @type {T}
   */
  #type;

  /**
   *
   * @param {T} type
   */
  constructor(type) {
    assert(GPU_SCALAR_TYPES.has(type.type), 'Vector type must be a scalar type');
    this.#type = type;
  }

  toString() {
    return `Vec3(${String(this.#type)})`;
  }

  /**
   * @returns {typeof GPU_VEC3}
   */
  get type() {
    return GPU_VEC3;
  }

  get byteSize() {
    return this.#type.byteSize * 3;
  }

  get alignment() {
    return nextPowerOfTwo(this.#type.alignment * 3);
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {Tup3<R>}
   */
  read(view, offset = 0) {
    return [
      this.getX(view, offset),
      this.getY(view, offset),
      this.getZ(view, offset),
    ];
  }

  /**
   * @param {DataView} view
   * @param {Tup3<R>} value
   * @param {number} [offset=0]
   */
  write(view, value, offset = 0) {
    this.setX(view, value[0], offset);
    this.setY(view, value[1], offset);
    this.setZ(view, value[2], offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {Tup3<R>}
   */
  readAt(view, index, offset = 0) {
    return this.read(view, index * this.byteSize + offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {Tup3<R>} value
   * @param {number} [offset=0]
   */
  writeAt(view, index, value, offset = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} [offset=0]
   * @param {number} [length=1]
   * @returns {V}
   */
  view(buffer, offset = 0, length = 1) {
    return this.#type.view(buffer, offset, length * 3);
  }

  get offsetX() {
    return 0;
  }

  get offsetY() {
    return this.#type.byteSize;
  }

  get offsetZ() {
    return this.#type.byteSize * 2;
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {R}
   */
  getX(view, offset = 0) {
    return this.#type.read(view, offset + this.offsetX);
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {R}
   */
  getY(view, offset = 0) {
    return this.#type.read(view, offset + this.offsetY);
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {R}
   */
  getZ(view, offset = 0) {
    return this.#type.read(view, offset + this.offsetZ);
  }

  /**
   * @param {DataView} view
   * @param {R} value
   * @param {number} [offset=0]
   */
  setX(view, value, offset = 0) {
    this.#type.write(view, value, offset + this.offsetX);
  }

  /**
   * @param {DataView} view
   * @param {R} value
   * @param {number} [offset=0]
   */
  setY(view, value, offset = 0) {
    this.#type.write(view, value, offset + this.offsetY);
  }

  /**
   * @param {DataView} view
   * @param {R} value
   * @param {number} [offset=0]
   */
  setZ(view, value, offset = 0) {
    this.#type.write(view, value, offset + this.offsetZ);
  }
}

/**
 * @template {IType<R, V>} T
 * @template [R=ITypeR<T>]
 * @template [V=ITypeV<T>]
 * @implements {IType<Tup4<R>, V>}
 */
export class Vec4 {
  /**
   * @type {T}
   */
  #type;

  /**
   * @param {T} type
   */
  constructor(type) {
    assert(GPU_SCALAR_TYPES.has(type.type), 'Vector type must be a scalar type');
    this.#type = type;
  }

  toString() {
    return `Vec4(${String(this.#type)})`;
  }

  /**
   * @type {typeof GPU_VEC4}
   */
  get type() {
    return GPU_VEC4;
  }

  get byteSize() {
    return this.#type.byteSize * 4;
  }

  get alignment() {
    return this.#type.alignment * 4;
  }

  get offsetX() {
    return 0;
  }

  get offsetY() {
    return this.#type.byteSize;
  }

  get offsetZ() {
    return this.#type.byteSize * 2;
  }

  get offsetW() {
    return this.#type.byteSize * 3;
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {Tup4<R>}
   */
  read(view, offset = 0) {
    return [
      this.getX(view, offset),
      this.getY(view, offset),
      this.getZ(view, offset),
      this.getW(view, offset),
    ];
  }

  /**
   * @param {DataView} view
   * @param {Tup4<R>} value
   * @param {number} [offset=0]
   */
  write(view, value, offset = 0) {
    this.setX(view, value[0], offset);
    this.setY(view, value[1], offset);
    this.setZ(view, value[2], offset);
    this.setW(view, value[3], offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {Tup4<R>}
   */
  readAt(view, index, offset = 0) {
    return this.read(view, index * this.byteSize + offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {Tup4<R>} value
   * @param {number} [offset=0]
   */
  writeAt(view, index, value, offset = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} [offset=0]
   * @param {number} [length=1]
   * @returns {V}
   */
  view(buffer, offset = 0, length = 1) {
    return this.#type.view(buffer, offset, length * 4);
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {R}
   */
  getX(view, offset = 0) {
    return this.#type.read(view, offset + this.offsetX);
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {R}
   */
  getY(view, offset = 0) {
    return this.#type.read(view, offset + this.offsetY);
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {R}
   */
  getZ(view, offset = 0) {
    return this.#type.read(view, offset + this.offsetZ);
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {R}
   */
  getW(view, offset = 0) {
    return this.#type.read(view, offset + this.offsetW);
  }

  /**
   * @param {DataView} view
   * @param {R} value
   * @param {number} [offset=0]
   */
  setX(view, value, offset = 0) {
    this.#type.write(view, value, offset + this.offsetX);
  }

  /**
   * @param {DataView} view
   * @param {R} value
   * @param {number} [offset=0]
   */
  setY(view, value, offset = 0) {
    this.#type.write(view, value, offset + this.offsetY);
  }

  /**
   * @param {DataView} view
   * @param {R} value
   * @param {number} [offset=0]
   */
  setZ(view, value, offset = 0) {
    this.#type.write(view, value, offset + this.offsetZ);
  }

  /**
   * @param {DataView} view
   * @param {R} value
   * @param {number} [offset=0]
   */
  setW(view, value, offset = 0) {
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

/**
 * @implements {IType<number, Float32Array>}
 */
class Float32Type {
  /**
   * @returns {string}
   */
  toString() {
    return 'Float32';
  }

  /**
   * @returns {typeof GPU_F32}
   */
  get type() {
    return GPU_F32;
  }

  /**
   * @returns {number}
   */
  get byteSize() {
    return 4;
  }

  /**
   * @returns {number}
   */
  get alignment() {
    return 4;
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {number}
   */
  read(view, offset = 0) {
    return view.getFloat32(offset, true);
  }

  /**
   * @param {DataView} view
   * @param {number} value
   * @param {number} [offset=0]
   */
  write(view, value, offset = 0) {
    view.setFloat32(offset, value, true);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {number}
   */
  readAt(view, index, offset = 0) {
    return view.getFloat32(index * this.byteSize + offset, true);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} value
   * @param {number} [offset=0]
   */
  writeAt(view, index, value, offset = 0) {
    view.setFloat32(index * this.byteSize + offset, value, true);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} [offset=0]
   * @param {number} [length=1]
   * @returns {Float32Array}
   */
  view(buffer, offset = 0, length = 1) {
    return new Float32Array(buffer, offset, length);
  }
}

/**
 * @implements {IType<number, Uint32Array>}
 */
class Uint32Type {
  /**
   * @returns {string}
   */
  toString() {
    return 'Uint32';
  }

  /**
   * @returns {typeof GPU_U32}
   */
  get type() {
    return GPU_U32;
  }

  /**
   * @returns {number}
   */
  get byteSize() {
    return 4;
  }

  /**
   * @returns {number}
   */
  get alignment() {
    return 4;
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {number}
   */
  read(view, offset = 0) {
    return view.getUint32(offset, true);
  }

  /**
   * @param {DataView} view
   * @param {number} value
   * @param {number} [offset=0]
   */
  write(view, value, offset = 0) {
    view.setUint32(offset, value, true);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {number}
   */
  readAt(view, index, offset = 0) {
    return view.getUint32(index * this.byteSize + offset, true);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} value
   * @param {number} [offset=0]
   */
  writeAt(view, index, value, offset = 0) {
    view.setUint32(index * this.byteSize + offset, value, true);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} [offset=0]
   * @param {number} [length=1]
   * @returns {Uint32Array}
   */
  view(buffer, offset = 0, length = 1) {
    return new Uint32Array(buffer, offset, length);
  }
}

/**
 * @implements {IType<number, Int32Array>}
 */
class Int32Type {
  /**
   * @returns {string}
   */
  toString() {
    return 'Int32';
  }

  /**
   * @returns {typeof GPU_I32}
   */
  get type() {
    return GPU_I32;
  }

  /**
   * @returns {number}
   */
  get byteSize() {
    return 4;
  }

  /**
   * @returns {number}
   */
  get alignment() {
    return 4;
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {number}
   */
  read(view, offset = 0) {
    return view.getInt32(offset, true);
  }

  /**
   * @param {DataView} view
   * @param {number} value
   * @param {number} [offset=0]
   */
  write(view, value, offset = 0) {
    view.setInt32(offset, value, true);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {number}
   */
  readAt(view, index, offset = 0) {
    return view.getInt32(index * this.byteSize + offset, true);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} value
   * @param {number} [offset=0]
   */
  writeAt(view, index, value, offset = 0) {
    view.setInt32(index * this.byteSize + offset, value, true);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} [offset=0]
   * @param {number} [length=1]
   * @returns {Int32Array}
   */
  view(buffer, offset = 0, length = 1) {
    return new Int32Array(buffer, offset, length);
  }
}

/**
 * @implements {IType<boolean, Uint32Array>}
 */
class BoolType {
  /**
   * @returns {string}
   */
  toString() {
    return 'Bool';
  }

  /**
   * @returns {typeof GPU_BOOL}
   */
  get type() {
    return GPU_BOOL;
  }

  /**
   * @returns {number}
   * @see https://gpuweb.github.io/gpuweb/wgsl/#why-is-bool-4-bytes
   */
  get byteSize() {
    return 4;
  }

  /**
   * @returns {number}
   * @see https://gpuweb.github.io/gpuweb/wgsl/#why-is-bool-4-bytes
   */
  get alignment() {
    return 4;
  }

  /**
   * @param {DataView} view
   * @param {number} [offset=0]
   * @returns {boolean}
   */
  read(view, offset = 0) {
    return !!view.getInt32(offset, true);
  }

  /**
   * @param {DataView} view
   * @param {boolean} value
   * @param {number} [offset=0]
   */
  write(view, value, offset = 0) {
    view.setInt32(offset, value ? 1 : 0, true);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {number} [offset=0]
   * @returns {boolean}
   */
  readAt(view, index, offset = 0) {
    return this.read(view, index * this.byteSize + offset);
  }

  /**
   * @param {DataView} view
   * @param {number} index
   * @param {boolean} value
   * @param {number} [offset=0]
   */
  writeAt(view, index, value, offset = 0) {
    this.write(view, value, index * this.byteSize + offset);
  }

  /**
   * @param {ArrayBuffer} buffer
   * @param {number} [offset=0]
   * @param {number} [length=1]
   * @returns {Uint32Array}
   */
  view(buffer, offset = 0, length = 1) {
    return new Uint32Array(buffer, offset, length);
  }
}

// Type helpers

export const Bool = new BoolType();

// export const Float16 = new Float16Type();
export const Float32 = new Float32Type();
export const Uint32 = new Uint32Type();
export const Int32 = new Int32Type();

export const Vec2B = new Vec2(Bool);
export const Vec3B = new Vec3(Bool);
export const Vec4B = new Vec4(Bool);

// export const Vec2H = new Vec2(Float16);
// export const Vec3H = new Vec3(Float16);
// export const Vec4H = new Vec4(Float16);
// export const Mat2x2H = new Mat2x2(Float16);
// export const Mat3x3H = new Mat3x3(Float16);
// export const Mat4x4H = new Mat4x4(Float16);

export const Vec2F = new Vec2(Float32);
export const Vec3F = new Vec3(Float32);
export const Vec4F = new Vec4(Float32);
export const Mat2x2F = new Mat2x2(Float32);
export const Mat3x3F = new Mat3x3(Float32);
export const Mat4x4F = new Mat4x4(Float32);

export const Vec2U = new Vec2(Uint32);
export const Vec3U = new Vec3(Uint32);
export const Vec4U = new Vec4(Uint32);
export const Mat2x2U = new Mat2x2(Uint32);
export const Mat3x3U = new Mat3x3(Uint32);
export const Mat4x4U = new Mat4x4(Uint32);

export const Vec2I = new Vec2(Int32);
export const Vec3I = new Vec3(Int32);
export const Vec4I = new Vec4(Int32);
export const Mat2x2I = new Mat2x2(Int32);
export const Mat3x3I = new Mat3x3(Int32);
export const Mat4x4I = new Mat4x4(Int32);

// Private helpers

/**
 * @param {number} value
 * @returns {number}
 */
function nextPowerOfTwo(value) {
  return 2 ** Math.ceil(Math.log2(value));
}

/**
 * @param {number} k
 * @param {number} n
 * @returns {number}
 * @see https://gpuweb.github.io/gpuweb/wgsl/#roundup
 */
function wgslRoundUp(k, n) {
  return Math.ceil(n / k) * k;
}

/**
 * @template {object} T
 * @param {T} obj
 * @returns {Array<keyof T>}
 */
function typedObjectKeys(obj) {
  return /** @type {(keyof T)[]} */ (Object.keys(obj));
}

/**
 * @param {boolean} condition
 * @param {string} [message]
 */
function assert(condition, message = '') {
  if (!condition) {
    throw Error(message);
  }
}
