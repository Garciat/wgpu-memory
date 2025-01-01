import { assertEquals } from "jsr:@std/assert";

import { FormatSnorm8 } from "../../src/formats/snorm8.ts";

Deno.test("FormatSnorm8.read", () => {
  const offset = 7;
  const view = new DataView(new ArrayBuffer(offset + 1));

  view.setUint8(offset, 0b0111_1111);

  assertEquals(FormatSnorm8.read(view, offset), 1);

  view.setUint8(offset, 0b0000_0000);

  assertEquals(FormatSnorm8.read(view, offset), 0);

  view.setUint8(offset, 0b1000_0000);

  assertEquals(FormatSnorm8.read(view, offset), -1);
});

Deno.test("FormatSnorm8.write", () => {
  const offset = 7;
  const view = new DataView(new ArrayBuffer(offset + 1));

  FormatSnorm8.write(view, 1, offset);

  assertEquals(view.getUint8(offset), 0b0111_1111);

  FormatSnorm8.write(view, 0, offset);

  assertEquals(view.getUint8(offset), 0b0000_0000);

  FormatSnorm8.write(view, -1, offset);

  assertEquals(view.getUint8(offset), 0b1000_0001);

  FormatSnorm8.write(view, NaN, offset);

  assertEquals(view.getUint8(offset), 0b0000_0000);

  FormatSnorm8.write(view, Infinity, offset);

  assertEquals(view.getUint8(offset), 0b0111_1111);

  FormatSnorm8.write(view, -Infinity, offset);

  assertEquals(view.getUint8(offset), 0b1000_0001);
});
