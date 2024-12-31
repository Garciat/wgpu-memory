import * as memory from "../src/mod.ts";

// deno-lint-ignore no-explicit-any
export const asAny = (value: any) => value;

export const TestStruct = memory.StructOf({
  a: { index: 0, type: memory.Float32 },
});
