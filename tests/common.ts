import * as memory from "../src/mod.ts";

// deno-lint-ignore no-explicit-any
export const asAny = (value: any) => value;

export const TestStruct = new memory.Struct({
  a: { index: 0, type: memory.Float32 },
});
