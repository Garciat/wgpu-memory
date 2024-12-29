import { assertEquals, assertThrows } from "jsr:@std/assert";

import * as memory from "../src/mod.ts";
import { asAny, TestStruct } from "./common.ts";

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
  assertEquals(M.offset([1, 1]), 12);

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
  assertEquals(M.offset([1, 1]), 20);

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
  assertEquals(M.offset([1, 1]), 20);

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
});
