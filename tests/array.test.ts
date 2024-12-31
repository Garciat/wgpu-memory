import { assertEquals, assertThrows } from "jsr:@std/assert";

import * as memory from "../src/mod.ts";

import { asAny } from "./common.ts";

Deno.test("ArrayType", () => {
  const A = memory.ArrayOf(memory.Int32, 4);
  assertEquals(A.elementCount, 4);
  assertEquals(A.elementType, memory.Int32);
  assertEquals(String(A), "array<i32, 4>");
  assertEquals(A.toCode("memory"), "memory.ArrayOf(memory.Int32, 4)");
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
  assertThrows(
    () => memory.ArrayOf(memory.Int32, asAny(0)),
    RangeError,
  );
  assertThrows(
    () => memory.ArrayOf(memory.Int32, asAny(-1)),
    RangeError,
  );
});
