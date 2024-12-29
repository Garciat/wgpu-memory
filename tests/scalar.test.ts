import { assertEquals, assertThrows } from "jsr:@std/assert";

import * as memory from "../src/mod.ts";

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
