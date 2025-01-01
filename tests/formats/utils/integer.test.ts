import { assertEquals } from "jsr:@std/assert";

import {
  Sint8,
  Uint10,
  Uint16,
  Uint2,
  Uint8,
} from "../../../src/formats/utils/integer.ts";

Deno.test("Uint2.toInteger", () => {
  assertEquals(Uint2.toInteger(Uint2.ZERO_BITS), 0);
  assertEquals(Uint2.toInteger(Uint2.MAX_VALUE_BITS), 3);

  for (let i = 0; i <= Uint2.MAX_VALUE; i++) {
    assertEquals(Uint2.toInteger(Uint2.fromInteger(i)), i);
  }
});

Deno.test("Uint2.fromIntegerClamped", () => {
  assertEquals(Uint2.fromIntegerClamped(-1), 0);

  for (let i = 0; i <= Uint2.MAX_VALUE; i++) {
    assertEquals(Uint2.fromIntegerClamped(i), i);
  }

  assertEquals(
    Uint2.fromIntegerClamped(Uint2.MAX_VALUE + 1),
    Uint2.MAX_VALUE_BITS,
  );
});

Deno.test("Uint2.fromInteger", () => {
  assertEquals(Uint2.fromInteger(-1), 3);

  for (let i = 0; i <= Uint2.MAX_VALUE; i++) {
    assertEquals(Uint2.fromInteger(i), i);
    assertEquals(Uint2.fromInteger(Uint2.MAX_VALUE + 1 + i), i);
  }
});

Deno.test("Uint8.toInteger", () => {
  assertEquals(Uint8.toInteger(Uint8.ZERO_BITS), 0);
  assertEquals(Uint8.toInteger(Uint8.MAX_VALUE_BITS), 255);

  for (let i = 0; i <= Uint8.MAX_VALUE; i++) {
    assertEquals(Uint8.toInteger(Uint8.fromInteger(i)), i);
  }
});

Deno.test("Uint8.fromIntegerClamped", () => {
  assertEquals(Uint8.fromIntegerClamped(-1), 0);

  for (let i = 0; i <= Uint8.MAX_VALUE; i++) {
    assertEquals(Uint8.fromIntegerClamped(i), i);
  }

  assertEquals(
    Uint8.fromIntegerClamped(Uint8.MAX_VALUE + 1),
    Uint8.MAX_VALUE_BITS,
  );
});

Deno.test("Uint8.fromInteger", () => {
  assertEquals(Uint8.fromInteger(-1), 255);

  for (let i = 0; i <= Uint8.MAX_VALUE; i++) {
    assertEquals(Uint8.fromInteger(i), i);
    assertEquals(Uint8.fromInteger(Uint8.MAX_VALUE + 1 + i), i);
  }
});

Deno.test("Uint10.toInteger", () => {
  assertEquals(Uint10.toInteger(Uint10.ZERO_BITS), 0);
  assertEquals(Uint10.toInteger(Uint10.MAX_VALUE_BITS), 1023);

  for (let i = 0; i <= Uint10.MAX_VALUE; i++) {
    assertEquals(Uint10.toInteger(Uint10.fromInteger(i)), i);
  }
});

Deno.test("Uint10.fromIntegerClamped", () => {
  assertEquals(Uint10.fromIntegerClamped(-1), 0);

  for (let i = 0; i <= Uint10.MAX_VALUE; i++) {
    assertEquals(Uint10.fromIntegerClamped(i), i);
  }

  assertEquals(
    Uint10.fromIntegerClamped(Uint10.MAX_VALUE + 1),
    Uint10.MAX_VALUE_BITS,
  );
});

Deno.test("Uint10.fromInteger", () => {
  assertEquals(Uint10.fromInteger(-1), 1023);

  for (let i = 0; i <= Uint10.MAX_VALUE; i++) {
    assertEquals(Uint10.fromInteger(i), i);
    assertEquals(Uint10.fromInteger(Uint10.MAX_VALUE + 1 + i), i);
  }
});

Deno.test("Uint16.toInteger", () => {
  assertEquals(Uint16.toInteger(Uint16.ZERO_BITS), 0);
  assertEquals(Uint16.toInteger(Uint16.MAX_VALUE_BITS), 65535);

  for (let i = 0; i <= Uint16.MAX_VALUE; i++) {
    assertEquals(Uint16.toInteger(Uint16.fromInteger(i)), i);
  }
});

Deno.test("Uint16.fromIntegerClamped", () => {
  assertEquals(Uint16.fromIntegerClamped(-1), 0);

  for (let i = 0; i <= Uint16.MAX_VALUE; i++) {
    assertEquals(Uint16.fromIntegerClamped(i), i);
  }

  assertEquals(
    Uint16.fromIntegerClamped(Uint16.MAX_VALUE + 1),
    Uint16.MAX_VALUE_BITS,
  );
});

Deno.test("Uint16.fromInteger", () => {
  assertEquals(Uint16.fromInteger(-1), 65535);

  for (let i = 0; i <= Uint16.MAX_VALUE; i++) {
    assertEquals(Uint16.fromInteger(i), i);
    assertEquals(Uint16.fromInteger(Uint16.MAX_VALUE + 1 + i), i);
  }
});

Deno.test("Sint8.toInteger", () => {
  assertEquals(Sint8.toInteger(Sint8.ZERO_BITS), 0);
  assertEquals(Sint8.toInteger(Sint8.MAX_VALUE_BITS), 127);
  assertEquals(Sint8.toInteger(Sint8.MIN_VALUE_BITS), -128);

  for (let i = Sint8.MIN_VALUE; i <= Sint8.MAX_VALUE; i++) {
    assertEquals(Sint8.toInteger(Sint8.fromInteger(i)), i);
  }
});

Deno.test("Sint8.fromIntegerClamped", () => {
  assertEquals(
    Sint8.fromIntegerClamped(Sint8.MIN_VALUE - 1),
    Sint8.MIN_VALUE_BITS,
  );

  for (let i = Sint8.MIN_VALUE; i <= Sint8.MAX_VALUE; i++) {
    assertEquals(Sint8.fromIntegerClamped(i), Sint8.fromInteger(i));
  }

  assertEquals(
    Sint8.fromIntegerClamped(Sint8.MAX_VALUE + 1),
    Sint8.MAX_VALUE_BITS,
  );
});

Deno.test("Sint8.fromInteger", () => {
  assertEquals(Sint8.fromInteger(Sint8.MIN_VALUE), Sint8.MIN_VALUE_BITS);
  assertEquals(Sint8.fromInteger(Sint8.MAX_VALUE), Sint8.MAX_VALUE_BITS);
  assertEquals(Sint8.fromInteger(0), Sint8.ZERO_BITS);
});
