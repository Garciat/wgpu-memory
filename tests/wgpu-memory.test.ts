import { assertEquals, assertThrows } from "jsr:@std/assert";

import * as memory from "../src/wgpu-memory.ts";

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
