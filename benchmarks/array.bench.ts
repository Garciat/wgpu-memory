import * as memory from "../src/mod.ts";

const length = 20_000;

const TestType = memory.ArrayOf(memory.Float32, 8);

Deno.bench("wgpu-memory", { group: "Array writeAt" }, (b) => {
  const buffer = memory.allocate(TestType, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    TestType.writeAt(view, i, [i, i, i, i, i, i, i, i]);
  }

  b.end();
});

Deno.bench("DataView", { group: "Array writeAt" }, (b) => {
  const buffer = memory.allocate(TestType, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    for (let j = 0; j < 8; j++) {
      view.setFloat32(i * 32 + j * 4, i, true);
    }
  }

  b.end();
});

Deno.bench("TypedArray", { group: "Array writeAt", baseline: true }, (b) => {
  const buffer = memory.allocate(TestType, length);
  const view = new Float32Array(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    for (let j = 0; j < 8; j++) {
      view[i * 8 + j] = i;
    }
  }

  b.end();
});
