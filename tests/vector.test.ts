import { assertEquals, assertThrows } from "jsr:@std/assert";

import * as memory from "../src/mod.ts";

import { asAny, TestStruct } from "./common.ts";

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
  assertEquals(V.offset([1]), 4);

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
  assertEquals(V.offset([1]), 4);

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
  assertEquals(V.offset([1]), 4);

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
