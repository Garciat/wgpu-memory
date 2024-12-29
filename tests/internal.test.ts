import { assertThrows } from "jsr:@std/assert";

import { invariant } from "../src/internal/assert.ts";

Deno.test("invariant", () => {
  invariant(true, "This should not throw.");

  assertThrows(() => {
    invariant(false, "This should throw.");
  });
});
