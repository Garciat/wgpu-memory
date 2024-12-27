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
  const A = new memory.ArrayType(memory.Int32, 4);
  assertEquals(A.elementCount, 4);
  assertEquals(A.elementType, memory.Int32);
  assertEquals(String(A), "array<i32, 4>");
  assertEquals(A.toCode("memory"), "new memory.ArrayType(memory.Int32, 4)");
  assertEquals(A.type, "array");
  assertEquals(A.byteSize, 16);
  assertEquals(A.alignment, 4);

  const buffer = memory.allocate(A, 2);
  assertEquals(buffer.byteLength, 32);

  const view = new DataView(buffer);

  assertEquals(A.readAt(view, 0), [0, 0, 0, 0]);
  assertEquals(A.readAt(view, 1), [0, 0, 0, 0]);
  assertThrows(() => A.readAt(view, 2), RangeError);

  A.write(view, [1, 2, 3, 4]);
  assertEquals(A.read(view), [1, 2, 3, 4]);

  A.writeAt(view, 1, [5, 6, 7, 8]);
  assertEquals(A.readAt(view, 1), [5, 6, 7, 8]);

  A.set(view, 0, 9);
  assertEquals(A.get(view, 0), 9);

  assertEquals(
    A.viewAt(buffer, 0),
    [
      new Int32Array([9]),
      new Int32Array([2]),
      new Int32Array([3]),
      new Int32Array([4]),
    ],
  );

  assertEquals(
    A.viewAt(buffer, 1),
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

  assertEquals(
    A.view(buffer),
    new Int32Array([9, 2, 3, 4]),
  );
  assertEquals(
    A.view(buffer, 0),
    new Int32Array([9, 2, 3, 4]),
  );
  assertEquals(
    A.view(buffer, 0, 1),
    new Int32Array([9, 2, 3, 4]),
  );
  assertEquals(
    A.view(buffer, 0, 2),
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
  assertEquals(
    StructA.toCode("memory"),
    [
      "new memory.Struct({",
      "  u: { index: 0, type: memory.Float32 },",
      "  v: { index: 1, type: memory.Float32 },",
      "  w: { index: 2, type: memory.Vec2F },",
      "  x: { index: 3, type: memory.Float32 },",
      "})",
    ].join("\n"),
  );
  assertEquals(StructA.type, "struct");
  assertEquals(StructA.byteSize, 24);
  assertEquals(StructA.alignment, 8);

  assertEquals(StructA.fields.u.name, "u");
  assertEquals(StructA.fields.u.index, 0);
  assertEquals(StructA.fields.u.type, memory.Float32);
  assertEquals(StructA.fields.u.offset, 0);
  assertEquals(StructA.fields.u.alignment, 4);
  assertEquals(StructA.fields.u.byteSize, 4);

  assertEquals(StructA.fields.v.name, "v");
  assertEquals(StructA.fields.v.index, 1);
  assertEquals(StructA.fields.v.type, memory.Float32);
  assertEquals(StructA.fields.v.offset, 4);
  assertEquals(StructA.fields.v.alignment, 4);
  assertEquals(StructA.fields.v.byteSize, 4);

  assertEquals(StructA.fields.w.name, "w");
  assertEquals(StructA.fields.w.index, 2);
  assertEquals(StructA.fields.w.type, memory.Vec2F);
  assertEquals(StructA.fields.w.offset, 8);
  assertEquals(StructA.fields.w.alignment, 8);
  assertEquals(StructA.fields.w.byteSize, 8);

  assertEquals(StructA.fields.x.name, "x");
  assertEquals(StructA.fields.x.index, 3);
  assertEquals(StructA.fields.x.type, memory.Float32);
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

  assertThrows(() => StructA.view(buffer), TypeError);
});

Deno.test("Mat2x2", () => {
  assertEquals(memory.Mat2x2F.toCode("memory"), "memory.Mat2x2F");
  assertEquals(memory.Mat2x2H.toCode("memory"), "memory.Mat2x2H");

  const M = memory.Mat2x2F;
  assertEquals(M.shape, [2, 2]);
  assertEquals(M.componentType, memory.Float32);
  assertEquals(String(M), "mat2x2<f32>");
  assertEquals(M.type, "mat2x2");
  assertEquals(M.byteSize, 16);
  assertEquals(M.alignment, 8);

  const buffer = memory.allocate(M, 2);
  assertEquals(buffer.byteLength, 32);

  const view = new DataView(buffer);

  assertEquals(M.readAt(view, 0), [
    [0, 0],
    [0, 0],
  ]);
  assertEquals(M.readAt(view, 1), [
    [0, 0],
    [0, 0],
  ]);
  assertThrows(() => M.readAt(view, 2), RangeError);

  M.write(view, [
    [1, 2],
    [3, 4],
  ]);
  assertEquals(M.read(view), [
    [1, 2],
    [3, 4],
  ]);

  M.writeAt(view, 1, [
    [5, 6],
    [7, 8],
  ]);
  assertEquals(M.readAt(view, 1), [
    [5, 6],
    [7, 8],
  ]);

  M.set(view, [1, 1], 10);
  assertEquals(M.get(view, [1, 1]), 10);

  M.setAt(view, 1, 1, 42);
  assertEquals(M.getAt(view, 1, 1), 42);

  assertEquals(
    M.viewAt(buffer, 0),
    // deno-fmt-ignore
    new Float32Array([
      1, 2,
      3, 42,
    ]),
  );

  assertEquals(
    M.viewAt(buffer, 1),
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

  assertEquals(
    M.view(buffer),
    // deno-fmt-ignore
    new Float32Array([
      1, 2,
      3, 42,
    ]),
  );
  assertEquals(
    M.view(buffer, 0),
    // deno-fmt-ignore
    new Float32Array([
      1, 2,
      3, 42,
    ]),
  );
  assertEquals(
    M.view(buffer, 0, 1),
    // deno-fmt-ignore
    new Float32Array([
      1, 2,
      3, 42,
    ]),
  );
  assertEquals(
    M.view(buffer, 0, 2),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 42,
      5, 6, 7, 8,
    ]),
  );
});

Deno.test("Mat3x3", () => {
  assertEquals(memory.Mat3x3F.toCode("memory"), "memory.Mat3x3F");
  assertEquals(memory.Mat3x3H.toCode("memory"), "memory.Mat3x3H");

  const M = memory.Mat3x3F;
  assertEquals(M.shape, [3, 3]);
  assertEquals(M.componentType, memory.Float32);
  assertEquals(String(M), "mat3x3<f32>");
  assertEquals(M.type, "mat3x3");
  assertEquals(M.byteSize, 48);
  assertEquals(M.alignment, 16);

  const buffer = memory.allocate(M, 2);
  assertEquals(buffer.byteLength, 96);

  const view = new DataView(buffer);

  assertEquals(M.readAt(view, 0), [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  assertEquals(M.readAt(view, 1), [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  assertThrows(() => M.readAt(view, 2), RangeError);

  M.write(view, [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]);
  assertEquals(M.read(view), [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]);

  M.writeAt(view, 1, [
    [10, 11, 12],
    [13, 14, 15],
    [16, 17, 18],
  ]);
  assertEquals(M.readAt(view, 1), [
    [10, 11, 12],
    [13, 14, 15],
    [16, 17, 18],
  ]);

  M.set(view, [1, 1], 10);
  assertEquals(M.get(view, [1, 1]), 10);

  M.setAt(view, 1, 1, 42);
  assertEquals(M.getAt(view, 1, 1), 42);

  // Note below how the vec3 columns have a vec4 storage due to alignment
  assertEquals(
    M.viewAt(buffer, 0),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 0,
      4, 42, 6, 0,
      7, 8, 9, 0,
    ]),
  );

  assertEquals(
    M.viewAt(buffer, 1),
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

  assertEquals(
    M.view(buffer),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 0,
      4, 42, 6, 0,
      7, 8, 9, 0,
    ]),
  );
  assertEquals(
    M.view(buffer, 0),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 0,
      4, 42, 6, 0,
      7, 8, 9, 0,
    ]),
  );
  assertEquals(
    M.view(buffer, 0, 1),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 0,
      4, 42, 6, 0,
      7, 8, 9, 0,
    ]),
  );
  assertEquals(
    M.view(buffer, 0, 2),
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
  assertEquals(memory.Mat4x4F.toCode("memory"), "memory.Mat4x4F");
  assertEquals(memory.Mat4x4H.toCode("memory"), "memory.Mat4x4H");

  const M = memory.Mat4x4F;
  assertEquals(M.shape, [4, 4]);
  assertEquals(M.componentType, memory.Float32);
  assertEquals(String(M), "mat4x4<f32>");
  assertEquals(M.type, "mat4x4");
  assertEquals(M.byteSize, 64);
  assertEquals(M.alignment, 16);

  const buffer = memory.allocate(M, 2);
  assertEquals(buffer.byteLength, 128);

  const view = new DataView(buffer);

  assertEquals(M.readAt(view, 0), [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  assertEquals(M.readAt(view, 1), [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  assertThrows(() => M.readAt(view, 2), RangeError);

  M.write(view, [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
  ]);
  assertEquals(M.read(view), [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
  ]);

  M.writeAt(view, 1, [
    [17, 18, 19, 20],
    [21, 22, 23, 24],
    [25, 26, 27, 28],
    [29, 30, 31, 32],
  ]);
  assertEquals(M.readAt(view, 1), [
    [17, 18, 19, 20],
    [21, 22, 23, 24],
    [25, 26, 27, 28],
    [29, 30, 31, 32],
  ]);

  M.set(view, [1, 1], 10);
  assertEquals(M.get(view, [1, 1]), 10);

  M.setAt(view, 1, 1, 42);
  assertEquals(M.getAt(view, 1, 1), 42);

  assertEquals(
    M.viewAt(buffer, 0),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 4,
      5, 42, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
    ]),
  );

  assertEquals(
    M.viewAt(buffer, 1),
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

  assertEquals(
    M.view(buffer),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 4,
      5, 42, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
    ]),
  );
  assertEquals(
    M.view(buffer, 0),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 4,
      5, 42, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
    ]),
  );
  assertEquals(
    M.view(buffer, 0, 1),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 3, 4,
      5, 42, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
    ]),
  );
  assertEquals(
    M.view(buffer, 0, 2),
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
  assertEquals(memory.Vec2F.toCode("memory"), "memory.Vec2F");
  assertEquals(memory.Vec2H.toCode("memory"), "memory.Vec2H");
  assertEquals(memory.Vec2I.toCode("memory"), "memory.Vec2I");
  assertEquals(memory.Vec2U.toCode("memory"), "memory.Vec2U");
  assertEquals(memory.Vec2B.toCode("memory"), "memory.Vec2B");

  const V = memory.Vec2F;
  assertEquals(V.shape, [2]);
  assertEquals(V.componentType, memory.Float32);
  assertEquals(String(V), "vec2<f32>");
  assertEquals(V.type, "vec2");
  assertEquals(V.byteSize, 8);
  assertEquals(V.alignment, 8);

  const buffer = memory.allocate(V, 2);
  assertEquals(buffer.byteLength, 16);

  const view = new DataView(buffer);

  assertEquals(V.readAt(view, 0), [0, 0]);
  assertEquals(V.readAt(view, 1), [0, 0]);
  assertThrows(() => V.readAt(view, 2), RangeError);

  V.write(view, [1, 2]);
  assertEquals(V.read(view), [1, 2]);

  V.writeAt(view, 1, [3, 4]);
  assertEquals(V.readAt(view, 1), [3, 4]);

  V.set(view, [1], 40);
  assertEquals(V.get(view, [1]), 40);

  V.setX(view, 10);
  assertEquals(V.getX(view), 10);

  V.setY(view, 20);
  assertEquals(V.getY(view), 20);

  assertEquals(
    V.viewAt(buffer, 0),
    new Float32Array([10, 20]),
  );

  assertEquals(
    V.viewAt(buffer, 1),
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

  assertEquals(
    V.view(buffer),
    new Float32Array([10, 20]),
  );
  assertEquals(
    V.view(buffer, 0),
    new Float32Array([10, 20]),
  );
  assertEquals(
    V.view(buffer, 0, 1),
    new Float32Array([10, 20]),
  );
  assertEquals(
    V.view(buffer, 0, 2),
    new Float32Array([10, 20, 3, 4]),
  );
});

Deno.test("Vec3", () => {
  assertEquals(memory.Vec3F.toCode("memory"), "memory.Vec3F");
  assertEquals(memory.Vec3H.toCode("memory"), "memory.Vec3H");
  assertEquals(memory.Vec3I.toCode("memory"), "memory.Vec3I");
  assertEquals(memory.Vec3U.toCode("memory"), "memory.Vec3U");
  assertEquals(memory.Vec3B.toCode("memory"), "memory.Vec3B");

  const V = memory.Vec3F;
  assertEquals(V.shape, [3]);
  assertEquals(V.componentType, memory.Float32);
  assertEquals(String(V), "vec3<f32>");
  assertEquals(V.type, "vec3");
  assertEquals(V.byteSize, 12);
  assertEquals(V.alignment, 16);

  const buffer = memory.allocate(V, 2);
  assertEquals(buffer.byteLength, 32);

  const view = new DataView(buffer);

  assertEquals(V.readAt(view, 0), [0, 0, 0]);
  assertEquals(V.readAt(view, 1), [0, 0, 0]);
  assertThrows(() => V.readAt(view, 2), RangeError);

  V.write(view, [1, 2, 3]);
  assertEquals(V.read(view), [1, 2, 3]);

  V.writeAt(view, 1, [4, 5, 6]);
  assertEquals(V.readAt(view, 1), [4, 5, 6]);

  V.set(view, [1], 40);
  assertEquals(V.get(view, [1]), 40);

  V.setX(view, 10);
  assertEquals(V.getX(view), 10);

  V.setY(view, 20);
  assertEquals(V.getY(view), 20);

  V.setZ(view, 30);
  assertEquals(V.getZ(view), 30);

  assertEquals(
    V.viewAt(buffer, 0),
    new Float32Array([10, 20, 30]),
  );

  assertEquals(
    V.viewAt(buffer, 1),
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

  assertEquals(
    V.view(buffer),
    new Float32Array([10, 20, 30, 0]),
  );
  assertEquals(
    V.view(buffer, 0),
    new Float32Array([10, 20, 30, 0]),
  );
  assertEquals(
    V.view(buffer, 0, 1),
    new Float32Array([10, 20, 30, 0]),
  );
  assertEquals(
    V.view(buffer, 0, 2),
    new Float32Array([10, 20, 30, 0, 4, 5, 6, 0]),
  );
});

Deno.test("Vec4", () => {
  assertEquals(memory.Vec4F.toCode("memory"), "memory.Vec4F");
  assertEquals(memory.Vec4H.toCode("memory"), "memory.Vec4H");
  assertEquals(memory.Vec4I.toCode("memory"), "memory.Vec4I");
  assertEquals(memory.Vec4U.toCode("memory"), "memory.Vec4U");
  assertEquals(memory.Vec4B.toCode("memory"), "memory.Vec4B");

  const V = memory.Vec4F;
  assertEquals(V.shape, [4]);
  assertEquals(V.componentType, memory.Float32);
  assertEquals(String(V), "vec4<f32>");
  assertEquals(V.type, "vec4");
  assertEquals(V.byteSize, 16);
  assertEquals(V.alignment, 16);

  const buffer = memory.allocate(V, 2);
  assertEquals(buffer.byteLength, 32);

  const view = new DataView(buffer);

  assertEquals(V.readAt(view, 0), [0, 0, 0, 0]);
  assertEquals(V.readAt(view, 1), [0, 0, 0, 0]);
  assertThrows(() => V.readAt(view, 2), RangeError);

  V.write(view, [1, 2, 3, 4]);
  assertEquals(V.read(view), [1, 2, 3, 4]);

  V.writeAt(view, 1, [5, 6, 7, 8]);
  assertEquals(V.readAt(view, 1), [5, 6, 7, 8]);

  V.set(view, [1], 40);
  assertEquals(V.get(view, [1]), 40);

  V.setX(view, 10);
  assertEquals(V.getX(view), 10);

  V.setY(view, 20);
  assertEquals(V.getY(view), 20);

  V.setZ(view, 30);
  assertEquals(V.getZ(view), 30);

  V.setW(view, 40);
  assertEquals(V.getW(view), 40);

  assertEquals(
    V.viewAt(buffer, 0),
    new Float32Array([10, 20, 30, 40]),
  );

  assertEquals(
    V.viewAt(buffer, 1),
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

  assertEquals(
    V.view(buffer),
    new Float32Array([10, 20, 30, 40]),
  );
  assertEquals(
    V.view(buffer, 0),
    new Float32Array([10, 20, 30, 40]),
  );
  assertEquals(
    V.view(buffer, 0, 1),
    new Float32Array([10, 20, 30, 40]),
  );
  assertEquals(
    V.view(buffer, 0, 2),
    new Float32Array([10, 20, 30, 40, 5, 6, 7, 8]),
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
  assertEquals(F32.toCode("memory"), "memory.Float32");
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
  assertEquals(F16.toCode("memory"), "memory.Float16");
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
  assertEquals(I32.toCode("memory"), "memory.Int32");
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
  assertEquals(U32.toCode("memory"), "memory.Uint32");
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
  assertEquals(Bool.toCode("memory"), "memory.Bool");
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
