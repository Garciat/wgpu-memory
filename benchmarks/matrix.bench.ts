import * as memory from "../src/mod.ts";

const length = 10_000;

const TestType = memory.Mat4x4F;

Deno.bench("wgpu-memory", { group: "Matrix writeAt" }, (b) => {
  const buffer = memory.allocate(TestType, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    TestType.writeAt(view, i, [
      [i, i, i, i],
      [i, i, i, i],
      [i, i, i, i],
      [i, i, i, i],
    ]);
  }

  b.end();
});

Deno.bench("DataView", { group: "Matrix writeAt" }, (b) => {
  const buffer = memory.allocate(TestType, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        view.setFloat32(i * 64 + j * 16 + k * 4, i, true);
      }
    }
  }

  b.end();
});

Deno.bench("TypedArray", { group: "Matrix writeAt", baseline: true }, (b) => {
  const buffer = memory.allocate(TestType, length);
  const view = new Float32Array(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        view[i * 16 + j * 4 + k] = i;
      }
    }
  }

  b.end();
});
