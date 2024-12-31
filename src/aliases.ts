import { BoolTypeImpl } from "./scalar/bool.ts";
import { Float16TypeImpl } from "./scalar/f16.ts";
import { Float32TypeImpl } from "./scalar/f32.ts";
import { Uint32TypeImpl } from "./scalar/u32.ts";
import { Int32TypeImpl } from "./scalar/i32.ts";

import { Vec2 } from "./vector/vec2.ts";
import { Vec3 } from "./vector/vec3.ts";
import { Vec4 } from "./vector/vec4.ts";

import { Mat2x2F as Mat2x2FImpl } from "./matrix/mat2x2f.ts";
import { Mat2x2H as Mat2x2HImpl } from "./matrix/mat2x2h.ts";
import { Mat3x3F as Mat3x3FImpl } from "./matrix/mat3x3f.ts";
import { Mat3x3H as Mat3x3HImpl } from "./matrix/mat3x3h.ts";
import { Mat4x4F as Mat4x4FImpl } from "./matrix/mat4x4f.ts";
import { Mat4x4H as Mat4x4HImpl } from "./matrix/mat4x4h.ts";

import type {
  BoolType,
  Float16Type,
  Float32Type,
  Int32Type,
  MatrixType,
  Uint32Type,
  Vector2Type,
  Vector3Type,
  Vector4Type,
} from "./types.ts";

/**
 * The boolean type.
 */
export const Bool: BoolType = new BoolTypeImpl();

/**
 * The 16-bit floating point type.
 */
export const Float16: Float16Type = new Float16TypeImpl();
/**
 * The 32-bit floating point type.
 */
export const Float32: Float32Type = new Float32TypeImpl();
/**
 * The 32-bit unsigned integer type.
 */
export const Uint32: Uint32Type = new Uint32TypeImpl();
/**
 * The 32-bit signed integer type.
 */
export const Int32: Int32Type = new Int32TypeImpl();

/**
 * A 2-dimensional vector of boolean values.
 */
export const Vec2B: Vector2Type<BoolType> = new Vec2(Bool);
/**
 * A 3-dimensional vector of boolean values.
 */
export const Vec3B: Vector3Type<BoolType> = new Vec3(Bool);
/**
 * A 4-dimensional vector of boolean values.
 */
export const Vec4B: Vector4Type<BoolType> = new Vec4(Bool);

/**
 * A 2-dimensional vector of 16-bit floating point values.
 */
export const Vec2H: Vector2Type<Float16Type> = new Vec2(Float16);
/**
 * A 3-dimensional vector of 16-bit floating point values.
 */
export const Vec3H: Vector3Type<Float16Type> = new Vec3(Float16);
/**
 * A 4-dimensional vector of 16-bit floating point values.
 */
export const Vec4H: Vector4Type<Float16Type> = new Vec4(Float16);
/**
 * A 2x2 matrix of 16-bit floating point values.
 */
export const Mat2x2H: MatrixType<Float16Type, 2, 2> = new Mat2x2HImpl();
/**
 * A 3x3 matrix of 16-bit floating point values.
 */
export const Mat3x3H: MatrixType<Float16Type, 3, 3> = new Mat3x3HImpl();
/**
 * A 4x4 matrix of 16-bit floating point values.
 */
export const Mat4x4H: MatrixType<Float16Type, 4, 4> = new Mat4x4HImpl();

/**
 * A 2-dimensional vector of 32-bit floating point values.
 */
export const Vec2F: Vector2Type<Float32Type> = new Vec2(Float32);
/**
 * A 3-dimensional vector of 32-bit floating point values.
 */
export const Vec3F: Vector3Type<Float32Type> = new Vec3(Float32);
/**
 * A 4-dimensional vector of 32-bit floating point values.
 */
export const Vec4F: Vector4Type<Float32Type> = new Vec4(Float32);
/**
 * A 2x2 matrix of 32-bit floating point values.
 */
export const Mat2x2F: MatrixType<Float32Type, 2, 2> = new Mat2x2FImpl();
/**
 * A 3x3 matrix of 32-bit floating point values.
 */
export const Mat3x3F: MatrixType<Float32Type, 3, 3> = new Mat3x3FImpl();
/**
 * A 4x4 matrix of 32-bit floating point values.
 */
export const Mat4x4F: MatrixType<Float32Type, 4, 4> = new Mat4x4FImpl();

/**
 * A 2-dimensional vector of 32-bit unsigned integer values.
 */
export const Vec2U: Vector2Type<Uint32Type> = new Vec2(Uint32);
/**
 * A 3-dimensional vector of 32-bit unsigned integer values.
 */
export const Vec3U: Vector3Type<Uint32Type> = new Vec3(Uint32);
/**
 * A 4-dimensional vector of 32-bit unsigned integer values.
 */
export const Vec4U: Vector4Type<Uint32Type> = new Vec4(Uint32);

/**
 * A 2-dimensional vector of 32-bit signed integer values.
 */
export const Vec2I: Vector2Type<Int32Type> = new Vec2(Int32);
/**
 * A 3-dimensional vector of 32-bit signed integer values.
 */
export const Vec3I: Vector3Type<Int32Type> = new Vec3(Int32);
/**
 * A 4-dimensional vector of 32-bit signed integer values.
 */
export const Vec4I: Vector4Type<Int32Type> = new Vec4(Int32);
