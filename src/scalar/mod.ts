import type { GPUFloatingPointType, GPUScalarType, IType } from "../types.ts";

import type { Float16Type } from "./f16.ts";
import type { Float32Type } from "./f32.ts";
import type { Uint32Type } from "./u32.ts";
import type { Int32Type } from "./i32.ts";
import type { BoolType } from "./bool.ts";

/**
 * All floating-point types.
 */
export type FloatingPointType = Float16Type | Float32Type;

/**
 * All scalar types.
 */
export type ScalarType =
  | Float16Type
  | Float32Type
  | Uint32Type
  | Int32Type
  | BoolType;

{
  // Avoid distributivity of union types by wrapping type parameters with [_]
  // See: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
  type Equal<T, U> = [T] extends [U] ? [U] extends [T] ? true : never : never;

  type ITypeType<T> = T extends IType<unknown, unknown, unknown> ? T["type"]
    : never;

  {
    const _: Equal<ITypeType<FloatingPointType>, GPUFloatingPointType> = true;
  }

  {
    const _: Equal<ITypeType<ScalarType>, GPUScalarType> = true;
  }
}
