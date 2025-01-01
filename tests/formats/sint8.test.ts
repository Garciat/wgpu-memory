import { assertEquals } from "jsr:@std/assert";

import { FormatSint8 } from "../../src/formats/sint8.ts";
import { Sint8 } from "../../src/formats/utils/integer.ts";

Deno.test("FormatSint8.read", () => {
  const offset = 7;
  const buffer = new ArrayBuffer(offset + 1);
  const view = new DataView(buffer);

  assertEquals(FormatSint8.read(view, offset), 0);

  view.setInt8(offset, 127);

  assertEquals(FormatSint8.read(view, offset), 127);

  view.setInt8(offset, -128);

  assertEquals(FormatSint8.read(view, offset), -128);

  view.setInt8(offset, 1);

  assertEquals(FormatSint8.read(view, offset), 1);
});

Deno.test("FormatSint8.write", () => {
  const offset = 7;
  const buffer = new ArrayBuffer(offset + 1);
  const view = new DataView(buffer);

  FormatSint8.write(view, Sint8.fromInteger(0), offset);

  assertEquals(view.getInt8(offset), 0);

  FormatSint8.write(view, Sint8.fromInteger(127), offset);

  assertEquals(view.getInt8(offset), 127);

  FormatSint8.write(view, Sint8.fromInteger(-128), offset);

  assertEquals(view.getInt8(offset), -128);

  FormatSint8.write(view, Sint8.fromInteger(1), offset);

  assertEquals(view.getInt8(offset), 1);
});
