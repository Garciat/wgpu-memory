import { assertEquals, assertThrows } from "jsr:@std/assert";

import * as memory from "../src/mod.ts";
import { Mat2x2F } from "../src/aliases.ts";

const TestStruct = new memory.Struct({
  a: { index: 0, type: memory.Float32 },
});

// deno-lint-ignore no-explicit-any
const asAny = (value: any) => value;

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

  assertEquals(memory.count(Mat2x2F, memory.allocate(Mat2x2F)), 1);
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
    i32x4.viewAt(buffer, 0),
    [
      new Int32Array([9]),
      new Int32Array([2]),
      new Int32Array([3]),
      new Int32Array([4]),
    ],
  );

  assertEquals(
    i32x4.viewAt(buffer, 1),
    [
      new Int32Array([5]),
      new Int32Array([6]),
      new Int32Array([7]),
      new Int32Array([8]),
    ],
  );

  assertEquals(
    new Int32Array(buffer),
    new Int32Array([9, 2, 3, 4, 5, 6, 7, 8]),
  );
});

Deno.test("ArrayType non-positive length", () => {
  assertThrows(() => new memory.ArrayType(memory.Int32, asAny(0)), RangeError);
  assertThrows(() => new memory.ArrayType(memory.Int32, asAny(-1)), RangeError);
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
    StructA.viewAt(buffer, 0),
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

  assertEquals(
    new Float32Array(buffer),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 40, 50, 5, 0,
      6, 7, 60, 70, 10, 0,
    ]),
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
    Mat2x2F.viewAt(buffer, 0),
    // deno-fmt-ignore
    new Float32Array([
      1, 2,
      3, 42,
    ]),
  );

  assertEquals(
    Mat2x2F.viewAt(buffer, 1),
    // deno-fmt-ignore
    new Float32Array([
      5, 6,
      7, 8,
    ]),
  );

  assertEquals(
    new Float32Array(buffer),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 42,
      5, 6, 7, 8,
    ]),
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

  // Note below how the vec3 columns have a vec4 storage due to alignment
  assertEquals(
    Mat3x3F.viewAt(buffer, 0),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 0,
      4, 42, 6, 0,
      7, 8, 9, 0,
    ]),
  );

  assertEquals(
    Mat3x3F.viewAt(buffer, 1),
    // deno-fmt-ignore
    new Float32Array([
      10, 11, 12, 0,
      13, 14, 15, 0,
      16, 17, 18, 0,
    ]),
  );

  assertEquals(
    new Float32Array(buffer),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 0,
      4, 42, 6, 0,
      7, 8, 9, 0,
      10, 11, 12, 0,
      13, 14, 15, 0,
      16, 17, 18, 0,
    ]),
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
    Mat4x4F.viewAt(buffer, 0),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 4,
      5, 42, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
    ]),
  );

  assertEquals(
    Mat4x4F.viewAt(buffer, 1),
    // deno-fmt-ignore
    new Float32Array([
      17, 18, 19, 20,
      21, 22, 23, 24,
      25, 26, 27, 28,
      29, 30, 31, 32,
    ]),
  );

  assertEquals(
    new Float32Array(buffer),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 4,
      5, 42, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
      17, 18, 19, 20,
      21, 22, 23, 24,
      25, 26, 27, 28,
      29, 30, 31, 32,
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
    Vec2F.viewAt(buffer, 0),
    new Float32Array([10, 20]),
  );

  assertEquals(
    Vec2F.viewAt(buffer, 1),
    new Float32Array([3, 4]),
  );

  assertEquals(
    new Float32Array(buffer),
    // deno-fmt-ignore
    new Float32Array([
      10, 20,
      3, 4,
    ]),
  );
});

Deno.test("Vec3", () => {
  const Vec3F = memory.Vec3F;
  assertEquals(String(Vec3F), "vec3<f32>");
  assertEquals(Vec3F.type, "vec3");
  assertEquals(Vec3F.byteSize, 12);
  assertEquals(Vec3F.alignment, 16);

  const buffer = memory.allocate(Vec3F, 2);
  assertEquals(buffer.byteLength, 32);

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
    Vec3F.viewAt(buffer, 0),
    new Float32Array([10, 20, 30]),
  );

  assertEquals(
    Vec3F.viewAt(buffer, 1),
    new Float32Array([4, 5, 6]),
  );

  assertEquals(
    new Float32Array(buffer),
    // deno-fmt-ignore
    new Float32Array([
      10, 20, 30, 0,
      4, 5, 6, 0,
    ]),
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
    Vec4F.viewAt(buffer, 0),
    new Float32Array([10, 20, 30, 40]),
  );

  assertEquals(
    Vec4F.viewAt(buffer, 1),
    new Float32Array([5, 6, 7, 8]),
  );

  assertEquals(
    new Float32Array(buffer),
    // deno-fmt-ignore
    new Float32Array([
      10, 20, 30, 40,
      5, 6, 7, 8,
    ]),
  );
});

Deno.test("incompatible composite types", () => {
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

  assertEquals(F32.viewAt(buffer, 0), new Float32Array([1]));
  assertEquals(F32.viewAt(buffer, 1), new Float32Array([2]));
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

  assertEquals(F16.viewAt(buffer, 0), new Float16Array([1]));
  assertEquals(F16.viewAt(buffer, 1), new Float16Array([2]));
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

  assertEquals(I32.viewAt(buffer, 0), new Int32Array([1]));
  assertEquals(I32.viewAt(buffer, 1), new Int32Array([2]));
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

  assertEquals(U32.viewAt(buffer, 0), new Uint32Array([1]));
  assertEquals(U32.viewAt(buffer, 1), new Uint32Array([2]));
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

  assertEquals(Bool.viewAt(buffer, 0), new Uint32Array([1]));
  assertEquals(Bool.viewAt(buffer, 1), new Uint32Array([0]));
});
