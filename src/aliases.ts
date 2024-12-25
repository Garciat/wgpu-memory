import { BoolType } from "./scalar/bool.ts";
import { Float16Type } from "./scalar/f16.ts";
import { Float32Type } from "./scalar/f32.ts";
import { Uint32Type } from "./scalar/u32.ts";
import { Int32Type } from "./scalar/i32.ts";

import { Vec2 } from "./vector/vec2.ts";
import { Vec3 } from "./vector/vec3.ts";
import { Vec4 } from "./vector/vec4.ts";

import { Mat2x2 } from "./matrix/mat2x2.ts";
import { Mat3x3 } from "./matrix/mat3x3.ts";
import { Mat4x4 } from "./matrix/mat4x4.ts";

export const Bool: BoolType = new BoolType();

export const Float16: Float16Type = new Float16Type();
export const Float32: Float32Type = new Float32Type();
export const Uint32: Uint32Type = new Uint32Type();
export const Int32: Int32Type = new Int32Type();

export const Vec2B: Vec2<BoolType> = new Vec2(Bool);
export const Vec3B: Vec3<BoolType> = new Vec3(Bool);
export const Vec4B: Vec4<BoolType> = new Vec4(Bool);

export const Vec2H: Vec2<Float16Type> = new Vec2(Float16);
export const Vec3H: Vec3<Float16Type> = new Vec3(Float16);
export const Vec4H: Vec4<Float16Type> = new Vec4(Float16);
export const Mat2x2H: Mat2x2<Float16Type> = new Mat2x2(Float16);
export const Mat3x3H: Mat3x3<Float16Type> = new Mat3x3(Float16);
export const Mat4x4H: Mat4x4<Float16Type> = new Mat4x4(Float16);

export const Vec2F: Vec2<Float32Type> = new Vec2(Float32);
export const Vec3F: Vec3<Float32Type> = new Vec3(Float32);
export const Vec4F: Vec4<Float32Type> = new Vec4(Float32);
export const Mat2x2F: Mat2x2<Float32Type> = new Mat2x2(Float32);
export const Mat3x3F: Mat3x3<Float32Type> = new Mat3x3(Float32);
export const Mat4x4F: Mat4x4<Float32Type> = new Mat4x4(Float32);

export const Vec2U: Vec2<Uint32Type> = new Vec2(Uint32);
export const Vec3U: Vec3<Uint32Type> = new Vec3(Uint32);
export const Vec4U: Vec4<Uint32Type> = new Vec4(Uint32);

export const Vec2I: Vec2<Int32Type> = new Vec2(Int32);
export const Vec3I: Vec3<Int32Type> = new Vec3(Int32);
export const Vec4I: Vec4<Int32Type> = new Vec4(Int32);
