import { assertEquals, assertThrows } from "jsr:@std/assert";

import * as memory from "../src/mod.ts";
import { asAny } from "./common.ts";

Deno.test("VectorOf", () => {
  assertThrows(() => memory.VectorOf(memory.Int32, asAny(5)));
});

Deno.test("MatrixOf", () => {
  const Mat2x2F = memory.MatrixOf(memory.Float32, [2, 2]);
  assertEquals(Mat2x2F.shape, [2, 2]);
  assertEquals(Mat2x2F.componentType, memory.Float32);

  const Mat3x3F = memory.MatrixOf(memory.Float32, [3, 3]);
  assertEquals(Mat3x3F.shape, [3, 3]);
  assertEquals(Mat3x3F.componentType, memory.Float32);

  const Mat4x4F = memory.MatrixOf(memory.Float32, [4, 4]);
  assertEquals(Mat4x4F.shape, [4, 4]);
  assertEquals(Mat4x4F.componentType, memory.Float32);

  const Mat2x2H = memory.MatrixOf(memory.Float16, [2, 2]);
  assertEquals(Mat2x2H.shape, [2, 2]);
  assertEquals(Mat2x2H.componentType, memory.Float16);

  const Mat3x3H = memory.MatrixOf(memory.Float16, [3, 3]);
  assertEquals(Mat3x3H.shape, [3, 3]);
  assertEquals(Mat3x3H.componentType, memory.Float16);

  const Mat4x4H = memory.MatrixOf(memory.Float16, [4, 4]);
  assertEquals(Mat4x4H.shape, [4, 4]);
  assertEquals(Mat4x4H.componentType, memory.Float16);

  assertThrows(() => memory.MatrixOf(memory.Float32, [asAny(5), asAny(5)]));
});

Deno.test("allocate", () => {
  const StructA = memory.StructOf({
    u: { index: 0, type: memory.Float32 },
    v: { index: 1, type: memory.Float32 },
    w: { index: 2, type: memory.Vec2F },
    x: { index: 3, type: memory.Float32 },
  });

  const buffer = memory.allocate(StructA, 5);
  assertEquals(buffer.byteLength, 120);
});

Deno.test("count", () => {
  const buffer = new ArrayBuffer(32);

  assertEquals(memory.count(memory.Vec2F, buffer), 4);
  assertEquals(memory.count(memory.Vec3F, buffer), 2);

  assertEquals(
    memory.count(memory.Mat2x2F, memory.allocate(memory.Mat2x2F)),
    1,
  );
});
