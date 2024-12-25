import { assertEquals, assertThrows } from "jsr:@std/assert";

import * as memory from "../src/mod.ts";

const TestStruct = new memory.Struct({
  a: { index: 0, type: memory.Float32 },
});

Deno.test("allocate", () => {
  const StructA = new memory.Struct({
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
});

Deno.test("ArrayType", () => {
  const i32x4 = new memory.ArrayType(memory.Int32, 4);
  assertEquals(String(i32x4), "array<i32, 4>");
  assertEquals(i32x4.type, "array");
  assertEquals(i32x4.byteSize, 16);
  assertEquals(i32x4.alignment, 4);

  const buffer = memory.allocate(i32x4, 2);
  assertEquals(buffer.byteLength, 32);

  const view = new DataView(buffer);

  assertEquals(i32x4.readAt(view, 0), [0, 0, 0, 0]);
  assertEquals(i32x4.readAt(view, 1), [0, 0, 0, 0]);
  assertThrows(() => i32x4.readAt(view, 2), RangeError);

  i32x4.write(view, [1, 2, 3, 4]);
  assertEquals(i32x4.read(view), [1, 2, 3, 4]);

  i32x4.writeAt(view, 1, [5, 6, 7, 8]);
  assertEquals(i32x4.readAt(view, 1), [5, 6, 7, 8]);

  i32x4.set(view, 0, 9);
  assertEquals(i32x4.get(view, 0), 9);

  assertEquals(
    i32x4.view(buffer, 0, 2),
    new Int32Array([9, 2, 3, 4, 5, 6, 7, 8]),
  );
});

Deno.test("Struct", () => {
  const StructA = new memory.Struct({
    u: { index: 0, type: memory.Float32 },
    v: { index: 1, type: memory.Float32 },
    w: { index: 2, type: memory.Vec2F },
    x: { index: 3, type: memory.Float32 },
  });

  assertEquals(
    String(StructA),
    "struct { u: f32, v: f32, w: vec2<f32>, x: f32 }",
  );
  assertEquals(StructA.type, "struct");
  assertEquals(StructA.byteSize, 24);
  assertEquals(StructA.alignment, 8);

  assertEquals(StructA.fields.u.name, "u");
  assertEquals(StructA.fields.u.offset, 0);
  assertEquals(StructA.fields.u.alignment, 4);
  assertEquals(StructA.fields.u.byteSize, 4);

  assertEquals(StructA.fields.v.name, "v");
  assertEquals(StructA.fields.v.offset, 4);
  assertEquals(StructA.fields.v.alignment, 4);
  assertEquals(StructA.fields.v.byteSize, 4);

  assertEquals(StructA.fields.w.name, "w");
  assertEquals(StructA.fields.w.offset, 8);
  assertEquals(StructA.fields.w.alignment, 8);
  assertEquals(StructA.fields.w.byteSize, 8);

  assertEquals(StructA.fields.x.name, "x");
  assertEquals(StructA.fields.x.offset, 16);
  assertEquals(StructA.fields.x.alignment, 4);
  assertEquals(StructA.fields.x.byteSize, 4);

  const buffer = memory.allocate(StructA, 2);
  assertEquals(buffer.byteLength, 48);

  const view = new DataView(buffer);

  assertEquals(StructA.readAt(view, 0), {
    u: 0,
    v: 0,
    w: [0, 0],
    x: 0,
  });
  assertEquals(StructA.readAt(view, 1), {
    u: 0,
    v: 0,
    w: [0, 0],
    x: 0,
  });
  assertThrows(() => StructA.readAt(view, 2), RangeError);

  StructA.write(view, { u: 1, v: 2, w: [3, 4], x: 5 });
  assertEquals(StructA.read(view), { u: 1, v: 2, w: [3, 4], x: 5 });

  StructA.writeAt(view, 1, { u: 6, v: 7, w: [8, 9], x: 10 });
  assertEquals(StructA.readAt(view, 1), { u: 6, v: 7, w: [8, 9], x: 10 });

  StructA.fields.w.write(view, [40, 50]);
  assertEquals(StructA.fields.w.read(view, 0), [40, 50]);

  StructA.fields.w.writeAt(view, 1, [60, 70]);
  assertEquals(StructA.fields.w.readAt(view, 1), [60, 70]);

  assertEquals(
    StructA.view(buffer),
    {
      u: new Float32Array([1]),
      v: new Float32Array([2]),
      w: new Float32Array([40, 50]),
      x: new Float32Array([5]),
    },
  );

  assertEquals(
    StructA.viewAt(buffer, 1),
    {
      u: new Float32Array([6]),
      v: new Float32Array([7]),
      w: new Float32Array([60, 70]),
      x: new Float32Array([10]),
    },
  );

  assertEquals(
    StructA.fields.w.viewAt(buffer, 1),
    new Float32Array([60, 70]),
  );
});

Deno.test("Mat2x2", () => {
  const Mat2x2F = memory.Mat2x2F;
  assertEquals(String(Mat2x2F), "mat2x2<f32>");
  assertEquals(Mat2x2F.type, "mat2x2");
  assertEquals(Mat2x2F.byteSize, 16);
  assertEquals(Mat2x2F.alignment, 8);

  const buffer = memory.allocate(Mat2x2F, 2);
  assertEquals(buffer.byteLength, 32);

  const view = new DataView(buffer);

  assertEquals(Mat2x2F.readAt(view, 0), [
    [0, 0],
    [0, 0],
  ]);
  assertEquals(Mat2x2F.readAt(view, 1), [
    [0, 0],
    [0, 0],
  ]);
  assertThrows(() => Mat2x2F.readAt(view, 2), RangeError);

  Mat2x2F.write(view, [
    [1, 2],
    [3, 4],
  ]);
  assertEquals(Mat2x2F.read(view), [
    [1, 2],
    [3, 4],
  ]);

  Mat2x2F.writeAt(view, 1, [
    [5, 6],
    [7, 8],
  ]);
  assertEquals(Mat2x2F.readAt(view, 1), [
    [5, 6],
    [7, 8],
  ]);

  Mat2x2F.set(view, 1, 1, 42);

  assertEquals(Mat2x2F.get(view, 1, 1), 42);

  assertEquals(
    Mat2x2F.view(buffer),
    new Float32Array([1, 2, 3, 42]),
  );
});

Deno.test("Mat3x3", () => {
  const Mat3x3F = memory.Mat3x3F;
  assertEquals(String(Mat3x3F), "mat3x3<f32>");
  assertEquals(Mat3x3F.type, "mat3x3");
  assertEquals(Mat3x3F.byteSize, 48);
  assertEquals(Mat3x3F.alignment, 16);

  const buffer = memory.allocate(Mat3x3F, 2);
  assertEquals(buffer.byteLength, 96);

  const view = new DataView(buffer);

  assertEquals(Mat3x3F.readAt(view, 0), [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  assertEquals(Mat3x3F.readAt(view, 1), [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  assertThrows(() => Mat3x3F.readAt(view, 2), RangeError);

  Mat3x3F.write(view, [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]);
  assertEquals(Mat3x3F.read(view), [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]);

  Mat3x3F.writeAt(view, 1, [
    [10, 11, 12],
    [13, 14, 15],
    [16, 17, 18],
  ]);
  assertEquals(Mat3x3F.readAt(view, 1), [
    [10, 11, 12],
    [13, 14, 15],
    [16, 17, 18],
  ]);

  Mat3x3F.set(view, 1, 1, 42);

  assertEquals(Mat3x3F.get(view, 1, 1), 42);

  assertEquals(
    Mat3x3F.view(buffer),
    new Float32Array([1, 2, 3, 4, 42, 6, 7, 8, 9]),
  );
});

Deno.test("Mat4x4", () => {
  const Mat4x4F = memory.Mat4x4F;
  assertEquals(String(Mat4x4F), "mat4x4<f32>");
  assertEquals(Mat4x4F.type, "mat4x4");
  assertEquals(Mat4x4F.byteSize, 64);
  assertEquals(Mat4x4F.alignment, 16);

  const buffer = memory.allocate(Mat4x4F, 2);
  assertEquals(buffer.byteLength, 128);

  const view = new DataView(buffer);

  assertEquals(Mat4x4F.readAt(view, 0), [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  assertEquals(Mat4x4F.readAt(view, 1), [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  assertThrows(() => Mat4x4F.readAt(view, 2), RangeError);

  Mat4x4F.write(view, [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
  ]);
  assertEquals(Mat4x4F.read(view), [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
  ]);

  Mat4x4F.writeAt(view, 1, [
    [17, 18, 19, 20],
    [21, 22, 23, 24],
    [25, 26, 27, 28],
    [29, 30, 31, 32],
  ]);
  assertEquals(Mat4x4F.readAt(view, 1), [
    [17, 18, 19, 20],
    [21, 22, 23, 24],
    [25, 26, 27, 28],
    [29, 30, 31, 32],
  ]);

  Mat4x4F.set(view, 1, 1, 42);

  assertEquals(Mat4x4F.get(view, 1, 1), 42);

  assertEquals(
    Mat4x4F.view(buffer),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 4,
      5, 42, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
    ]),
  );
});

Deno.test("Vec2", () => {
  const Vec2F = memory.Vec2F;
  assertEquals(String(Vec2F), "vec2<f32>");
  assertEquals(Vec2F.type, "vec2");
  assertEquals(Vec2F.byteSize, 8);
  assertEquals(Vec2F.alignment, 8);

  const buffer = memory.allocate(Vec2F, 2);
  assertEquals(buffer.byteLength, 16);

  const view = new DataView(buffer);

  assertEquals(Vec2F.readAt(view, 0), [0, 0]);
  assertEquals(Vec2F.readAt(view, 1), [0, 0]);
  assertThrows(() => Vec2F.readAt(view, 2), RangeError);

  Vec2F.write(view, [1, 2]);
  assertEquals(Vec2F.read(view), [1, 2]);

  Vec2F.writeAt(view, 1, [3, 4]);
  assertEquals(Vec2F.readAt(view, 1), [3, 4]);

  Vec2F.setX(view, 10);
  assertEquals(Vec2F.getX(view), 10);

  Vec2F.setY(view, 20);
  assertEquals(Vec2F.getY(view), 20);

  assertEquals(
    Vec2F.view(buffer),
    new Float32Array([10, 20]),
  );
});

Deno.test("Vec3", () => {
  const Vec3F = memory.Vec3F;
  assertEquals(String(Vec3F), "vec3<f32>");
  assertEquals(Vec3F.type, "vec3");
  assertEquals(Vec3F.byteSize, 12);
  assertEquals(Vec3F.alignment, 16);

  const buffer = memory.allocate(Vec3F, 2);
  assertEquals(buffer.byteLength, 24);

  const view = new DataView(buffer);

  assertEquals(Vec3F.readAt(view, 0), [0, 0, 0]);
  assertEquals(Vec3F.readAt(view, 1), [0, 0, 0]);
  assertThrows(() => Vec3F.readAt(view, 2), RangeError);

  Vec3F.write(view, [1, 2, 3]);
  assertEquals(Vec3F.read(view), [1, 2, 3]);

  Vec3F.writeAt(view, 1, [4, 5, 6]);
  assertEquals(Vec3F.readAt(view, 1), [4, 5, 6]);

  Vec3F.setX(view, 10);
  assertEquals(Vec3F.getX(view), 10);

  Vec3F.setY(view, 20);
  assertEquals(Vec3F.getY(view), 20);

  Vec3F.setZ(view, 30);
  assertEquals(Vec3F.getZ(view), 30);

  assertEquals(
    Vec3F.view(buffer),
    new Float32Array([10, 20, 30]),
  );
});

Deno.test("Vec4", () => {
  const Vec4F = memory.Vec4F;
  assertEquals(String(Vec4F), "vec4<f32>");
  assertEquals(Vec4F.type, "vec4");
  assertEquals(Vec4F.byteSize, 16);
  assertEquals(Vec4F.alignment, 16);

  const buffer = memory.allocate(Vec4F, 2);
  assertEquals(buffer.byteLength, 32);

  const view = new DataView(buffer);

  assertEquals(Vec4F.readAt(view, 0), [0, 0, 0, 0]);
  assertEquals(Vec4F.readAt(view, 1), [0, 0, 0, 0]);
  assertThrows(() => Vec4F.readAt(view, 2), RangeError);

  Vec4F.write(view, [1, 2, 3, 4]);
  assertEquals(Vec4F.read(view), [1, 2, 3, 4]);

  Vec4F.writeAt(view, 1, [5, 6, 7, 8]);
  assertEquals(Vec4F.readAt(view, 1), [5, 6, 7, 8]);

  Vec4F.setX(view, 10);
  assertEquals(Vec4F.getX(view), 10);

  Vec4F.setY(view, 20);
  assertEquals(Vec4F.getY(view), 20);

  Vec4F.setZ(view, 30);
  assertEquals(Vec4F.getZ(view), 30);

  Vec4F.setW(view, 40);
  assertEquals(Vec4F.getW(view), 40);

  assertEquals(
    Vec4F.view(buffer),
    new Float32Array([10, 20, 30, 40]),
  );
});

Deno.test("incompatible composite types", () => {
  // deno-lint-ignore no-explicit-any
  const asAny = (value: any) => value;

  assertThrows(() => new memory.Mat2x2(asAny(memory.Bool)), TypeError);
  assertThrows(() => new memory.Mat2x2(asAny(memory.Int32)), TypeError);
  assertThrows(() => new memory.Mat2x2(asAny(memory.Uint32)), TypeError);
  assertThrows(() => new memory.Mat2x2(asAny(memory.Vec2F)), TypeError);
  assertThrows(() => new memory.Mat2x2(asAny(memory.Mat2x2F)), TypeError);
  assertThrows(() => new memory.Mat2x2(asAny(TestStruct)), TypeError);

  assertThrows(() => new memory.Mat3x3(asAny(memory.Bool)), TypeError);
  assertThrows(() => new memory.Mat3x3(asAny(memory.Int32)), TypeError);
  assertThrows(() => new memory.Mat3x3(asAny(memory.Uint32)), TypeError);
  assertThrows(() => new memory.Mat3x3(asAny(memory.Vec2F)), TypeError);
  assertThrows(() => new memory.Mat3x3(asAny(memory.Mat2x2F)), TypeError);
  assertThrows(() => new memory.Mat3x3(asAny(TestStruct)), TypeError);

  assertThrows(() => new memory.Mat4x4(asAny(memory.Bool)), TypeError);
  assertThrows(() => new memory.Mat4x4(asAny(memory.Int32)), TypeError);
  assertThrows(() => new memory.Mat4x4(asAny(memory.Uint32)), TypeError);
  assertThrows(() => new memory.Mat4x4(asAny(memory.Vec2F)), TypeError);
  assertThrows(() => new memory.Mat4x4(asAny(memory.Mat2x2F)), TypeError);
  assertThrows(() => new memory.Mat4x4(asAny(TestStruct)), TypeError);

  assertThrows(() => new memory.Vec2(asAny(memory.Vec2F)), TypeError);
  assertThrows(() => new memory.Vec2(asAny(memory.Mat2x2F)), TypeError);
  assertThrows(() => new memory.Vec2(asAny(TestStruct)), TypeError);

  assertThrows(() => new memory.Vec3(asAny(memory.Vec2F)), TypeError);
  assertThrows(() => new memory.Vec3(asAny(memory.Mat2x2F)), TypeError);
  assertThrows(() => new memory.Vec3(asAny(TestStruct)), TypeError);

  assertThrows(() => new memory.Vec4(asAny(memory.Vec2F)), TypeError);
  assertThrows(() => new memory.Vec4(asAny(memory.Mat2x2F)), TypeError);
  assertThrows(() => new memory.Vec4(asAny(TestStruct)), TypeError);
});

Deno.test("Float32Type", () => {
  const F32 = memory.Float32;
  assertEquals(String(F32), "f32");
  assertEquals(F32.type, "f32");
  assertEquals(F32.byteSize, 4);
  assertEquals(F32.alignment, 4);

  const buffer = memory.allocate(F32, 2);
  assertEquals(buffer.byteLength, 8);

  const view = new DataView(buffer);

  assertEquals(F32.readAt(view, 0), 0);
  assertEquals(F32.readAt(view, 1), 0);
  assertThrows(() => F32.readAt(view, 2), RangeError);

  F32.write(view, 1);
  assertEquals(F32.read(view), 1);

  F32.writeAt(view, 1, 2);
  assertEquals(F32.readAt(view, 1), 2);

  assertEquals(F32.view(buffer, 0, 2), new Float32Array([1, 2]));
});

Deno.test("Float16Type", () => {
  const F16 = memory.Float16;
  assertEquals(String(F16), "f16");
  assertEquals(F16.type, "f16");
  assertEquals(F16.byteSize, 2);
  assertEquals(F16.alignment, 2);

  const buffer = memory.allocate(F16, 2);
  assertEquals(buffer.byteLength, 4);

  const view = new DataView(buffer);

  assertEquals(F16.readAt(view, 0), 0);
  assertEquals(F16.readAt(view, 1), 0);
  assertThrows(() => F16.readAt(view, 2), RangeError);

  F16.write(view, 1);
  assertEquals(F16.read(view), 1);

  F16.writeAt(view, 1, 2);
  assertEquals(F16.readAt(view, 1), 2);

  assertEquals(F16.view(buffer, 0, 2), new Float16Array([1, 2]));
});

Deno.test("Int32Type", () => {
  const I32 = memory.Int32;
  assertEquals(String(I32), "i32");
  assertEquals(I32.type, "i32");
  assertEquals(I32.byteSize, 4);
  assertEquals(I32.alignment, 4);

  const buffer = memory.allocate(I32, 2);
  assertEquals(buffer.byteLength, 8);

  const view = new DataView(buffer);

  assertEquals(I32.readAt(view, 0), 0);
  assertEquals(I32.readAt(view, 1), 0);
  assertThrows(() => I32.readAt(view, 2), RangeError);

  I32.write(view, 1);
  assertEquals(I32.read(view), 1);

  I32.writeAt(view, 1, 2);
  assertEquals(I32.readAt(view, 1), 2);

  assertEquals(I32.view(buffer, 0, 2), new Int32Array([1, 2]));
});

Deno.test("Uint32Type", () => {
  const U32 = memory.Uint32;
  assertEquals(String(U32), "u32");
  assertEquals(U32.type, "u32");
  assertEquals(U32.byteSize, 4);
  assertEquals(U32.alignment, 4);

  const buffer = memory.allocate(U32, 2);
  assertEquals(buffer.byteLength, 8);

  const view = new DataView(buffer);

  assertEquals(U32.readAt(view, 0), 0);
  assertEquals(U32.readAt(view, 1), 0);
  assertThrows(() => U32.readAt(view, 2), RangeError);

  U32.write(view, 1);
  assertEquals(U32.read(view), 1);

  U32.writeAt(view, 1, 2);
  assertEquals(U32.readAt(view, 1), 2);

  assertEquals(U32.view(buffer, 0, 2), new Uint32Array([1, 2]));
});

Deno.test("BoolType", () => {
  const Bool = memory.Bool;
  assertEquals(String(Bool), "bool");
  assertEquals(Bool.type, "bool");
  assertEquals(Bool.byteSize, 4);
  assertEquals(Bool.alignment, 4);

  const buffer = memory.allocate(Bool, 2);
  assertEquals(buffer.byteLength, 8);

  const view = new DataView(buffer);

  assertEquals(Bool.readAt(view, 0), false);
  assertEquals(Bool.readAt(view, 1), false);
  assertThrows(() => Bool.readAt(view, 2), RangeError);

  Bool.write(view, true);
  assertEquals(Bool.read(view), true);

  Bool.writeAt(view, 1, false);
  assertEquals(Bool.readAt(view, 1), false);

  assertEquals(Bool.view(buffer, 0, 2), new Uint32Array([1, 0]));
});

/**
 * @see https://gpuweb.github.io/gpuweb/wgsl/#alignment-and-size
 */
Deno.test("alignment", () => {
  assertEquals(memory.Bool.byteSize, 4);
  assertEquals(memory.Bool.alignment, 4);
  assertEquals(memory.Int32.byteSize, 4);
  assertEquals(memory.Int32.alignment, 4);
  assertEquals(memory.Uint32.byteSize, 4);
  assertEquals(memory.Uint32.alignment, 4);
  assertEquals(memory.Float32.byteSize, 4);
  assertEquals(memory.Float32.alignment, 4);
  // assertEquals(memory.Float16.byteSize, 2);
  // assertEquals(memory.Float16.alignment, 2);

  assertEquals(memory.Vec2B.byteSize, 8);
  assertEquals(memory.Vec2B.alignment, 8);
  assertEquals(memory.Vec2I.byteSize, 8);
  assertEquals(memory.Vec2I.alignment, 8);
  assertEquals(memory.Vec2U.byteSize, 8);
  assertEquals(memory.Vec2U.alignment, 8);
  assertEquals(memory.Vec2F.byteSize, 8);
  assertEquals(memory.Vec2F.alignment, 8);
  // assertEquals(memory.Vec2H.byteSize, 4);
  // assertEquals(memory.Vec2H.alignment, 4);

  assertEquals(memory.Vec3B.byteSize, 12);
  assertEquals(memory.Vec3B.alignment, 16);
  assertEquals(memory.Vec3I.byteSize, 12);
  assertEquals(memory.Vec3I.alignment, 16);
  assertEquals(memory.Vec3U.byteSize, 12);
  assertEquals(memory.Vec3U.alignment, 16);
  assertEquals(memory.Vec3F.byteSize, 12);
  assertEquals(memory.Vec3F.alignment, 16);
  // assertEquals(memory.Vec3H.byteSize, 6);
  // assertEquals(memory.Vec3H.alignment, 8);

  assertEquals(memory.Vec4B.byteSize, 16);
  assertEquals(memory.Vec4B.alignment, 16);
  assertEquals(memory.Vec4I.byteSize, 16);
  assertEquals(memory.Vec4I.alignment, 16);
  assertEquals(memory.Vec4U.byteSize, 16);
  assertEquals(memory.Vec4U.alignment, 16);
  assertEquals(memory.Vec4F.byteSize, 16);
  assertEquals(memory.Vec4F.alignment, 16);
  // assertEquals(memory.Vec4H.byteSize, 8);
  // assertEquals(memory.Vec4H.alignment, 8);

  assertEquals(memory.Mat2x2F.byteSize, 16);
  assertEquals(memory.Mat2x2F.alignment, 8);
  // assertEquals(memory.Mat2x2H.byteSize, 8);
  // assertEquals(memory.Mat2x2H.alignment, 4);

  assertEquals(memory.Mat3x3F.byteSize, 48);
  assertEquals(memory.Mat3x3F.alignment, 16);
  // assertEquals(memory.Mat3x3H.byteSize, 24);
  // assertEquals(memory.Mat3x3H.alignment, 8);

  assertEquals(memory.Mat4x4F.byteSize, 64);
  assertEquals(memory.Mat4x4F.alignment, 16);
  // assertEquals(memory.Mat4x4H.byteSize, 32);
  // assertEquals(memory.Mat4x4H.alignment, 8);

  /*
struct A {                                     //             align(8)  size(24)
    u: f32,                                    // offset(0)   align(4)  size(4)
    v: f32,                                    // offset(4)   align(4)  size(4)
    w: vec2<f32>,                              // offset(8)   align(8)  size(8)
    x: f32                                     // offset(16)  align(4)  size(4)
    // -- implicit struct size padding --      // offset(20)            size(4)
}
  */
  const StructA = new memory.Struct({
    u: { index: 0, type: memory.Float32 },
    v: { index: 1, type: memory.Float32 },
    w: { index: 2, type: memory.Vec2F },
    x: { index: 3, type: memory.Float32 },
  });
  assertEquals(StructA.fields.u.offset, 0);
  assertEquals(StructA.fields.u.alignment, 4);
  assertEquals(StructA.fields.u.byteSize, 4);
  assertEquals(StructA.fields.v.offset, 4);
  assertEquals(StructA.fields.v.alignment, 4);
  assertEquals(StructA.fields.v.byteSize, 4);
  assertEquals(StructA.fields.w.offset, 8);
  assertEquals(StructA.fields.w.alignment, 8);
  assertEquals(StructA.fields.w.byteSize, 8);
  assertEquals(StructA.fields.x.offset, 16);
  assertEquals(StructA.fields.x.alignment, 4);
  assertEquals(StructA.fields.x.byteSize, 4);
  assertEquals(StructA.alignment, 8);
  assertEquals(StructA.byteSize, 24);

  /*
struct B {                                     //             align(16) size(160)
    a: vec2<f32>,                              // offset(0)   align(8)  size(8)
    // -- implicit member alignment padding -- // offset(8)             size(8)
    b: vec3<f32>,                              // offset(16)  align(16) size(12)
    c: f32,                                    // offset(28)  align(4)  size(4)
    d: f32,                                    // offset(32)  align(4)  size(4)
    // -- implicit member alignment padding -- // offset(36)            size(4)
    e: A,                                      // offset(40)  align(8)  size(24)
    f: vec3<f32>,                              // offset(64)  align(16) size(12)
    // -- implicit member alignment padding -- // offset(76)            size(4)
    g: array<A, 3>,    // element stride 24       offset(80)  align(8)  size(72)
    h: i32                                     // offset(152) align(4)  size(4)
    // -- implicit struct size padding --      // offset(156)           size(4)
}
  */
  const StructB = new memory.Struct({
    a: { index: 0, type: memory.Vec2F },
    b: { index: 1, type: memory.Vec3F },
    c: { index: 2, type: memory.Float32 },
    d: { index: 3, type: memory.Float32 },
    e: { index: 4, type: StructA },
    f: { index: 5, type: memory.Vec3F },
    g: { index: 6, type: new memory.ArrayType(StructA, 3) },
    h: { index: 7, type: memory.Int32 },
  });
  assertEquals(StructB.fields.a.offset, 0);
  assertEquals(StructB.fields.a.alignment, 8);
  assertEquals(StructB.fields.a.byteSize, 8);
  assertEquals(StructB.fields.b.offset, 16);
  assertEquals(StructB.fields.b.alignment, 16);
  assertEquals(StructB.fields.b.byteSize, 12);
  assertEquals(StructB.fields.c.offset, 28);
  assertEquals(StructB.fields.c.alignment, 4);
  assertEquals(StructB.fields.c.byteSize, 4);
  assertEquals(StructB.fields.d.offset, 32);
  assertEquals(StructB.fields.d.alignment, 4);
  assertEquals(StructB.fields.d.byteSize, 4);
  assertEquals(StructB.fields.e.offset, 40);
  assertEquals(StructB.fields.e.alignment, 8);
  assertEquals(StructB.fields.e.byteSize, 24);
  assertEquals(StructB.fields.f.offset, 64);
  assertEquals(StructB.fields.f.alignment, 16);
  assertEquals(StructB.fields.f.byteSize, 12);
  assertEquals(StructB.fields.g.offset, 80);
  assertEquals(StructB.fields.g.alignment, 8);
  assertEquals(StructB.fields.g.byteSize, 72);
  assertEquals(StructB.fields.h.offset, 152);
  assertEquals(StructB.fields.h.alignment, 4);
  assertEquals(StructB.fields.h.byteSize, 4);
  assertEquals(StructB.alignment, 16);
  assertEquals(StructB.byteSize, 160);

  /*
// Array where:
//   - alignment is 4 = AlignOf(f32)
//   - element stride is 4 = roundUp(AlignOf(f32),SizeOf(f32)) = roundUp(4,4)
//   - size is 32 = stride * number_of_elements = 4 * 8
var small_stride: array<f32, 8>;
  */
  const SmallStride = new memory.ArrayType(memory.Float32, 8);
  assertEquals(SmallStride.alignment, 4);
  assertEquals(SmallStride.byteSize, 32);

  /*
// Array where:
//   - alignment is 16 = AlignOf(vec3<f32>) = 16
//   - element stride is 16 = roundUp(AlignOf(vec3<f32>), SizeOf(vec3<f32>))
//                          = roundUp(16,12)
//   - size is 128 = stride * number_of_elements = 16 * 8
var bigger_stride: array<vec3<f32>, 8>;
  */
  const BiggerStride = new memory.ArrayType(memory.Vec3F, 8);
  assertEquals(BiggerStride.alignment, 16);
  assertEquals(BiggerStride.byteSize, 128);
});
