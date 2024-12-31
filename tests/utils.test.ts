import { assertEquals, assertThrows } from "jsr:@std/assert";

import * as memory from "../src/mod.ts";
import { asAny } from "./common.ts";

Deno.test("VectorOf", () => {
  assertThrows(() => memory.VectorOf(memory.Int32, asAny(5)));
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
