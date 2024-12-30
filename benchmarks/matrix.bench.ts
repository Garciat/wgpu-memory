import { Mat4x4 } from "./matrix/mat4x4.ts";
import { Mat4x4F } from "../src/matrix/mat4x4f.ts";

import * as memory from "../src/mod.ts";

const length = 10_000;

const TestTypeGeneric = new Mat4x4(memory.Float32);
const TestTypeSpecialized = new Mat4x4F();

Deno.bench("wgpu-memory", { group: "Matrix writeAt" }, (b) => {
  const buffer = memory.allocate(TestTypeGeneric, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    TestTypeGeneric.writeAt(view, i, [
      [i, i, i, i],
      [i, i, i, i],
      [i, i, i, i],
      [i, i, i, i],
    ]);
  }

  b.end();
});

Deno.bench("wgpu-memory indexed", { group: "Matrix writeAt" }, (b) => {
  const buffer = memory.allocate(TestTypeGeneric, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        TestTypeGeneric.setAtIndexed(
          view,
          i,
          j as 0 | 1 | 2 | 3,
          k as 0 | 1 | 2 | 3,
          i,
        );
      }
    }
  }

  b.end();
});

Deno.bench("wgpu-memory flat", { group: "Matrix writeAt" }, (b) => {
  const buffer = memory.allocate(TestTypeGeneric, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    // deno-fmt-ignore
    TestTypeGeneric.writeAtFlat(view, i, [
      i, i, i, i,
      i, i, i, i,
      i, i, i, i,
      i, i, i, i,
    ]);
  }

  b.end();
});

Deno.bench("wgpu-memory view", { group: "Matrix writeAt" }, (b) => {
  const buffer = memory.allocate(TestTypeGeneric, length);

  b.start();

  for (let i = 0; i < length; i++) {
    const view = TestTypeGeneric.viewAt(buffer, i);
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        view[j * 4 + k] = i;
      }
    }
  }

  b.end();
});

Deno.bench("specialized wgpu-memory", { group: "Matrix writeAt" }, (b) => {
  const buffer = memory.allocate(TestTypeSpecialized, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    TestTypeSpecialized.writeAt(view, i, [
      [i, i, i, i],
      [i, i, i, i],
      [i, i, i, i],
      [i, i, i, i],
    ]);
  }

  b.end();
});

Deno.bench(
  "specialized wgpu-memory indexed",
  { group: "Matrix writeAt" },
  (b) => {
    const buffer = memory.allocate(TestTypeSpecialized, length);
    const view = new DataView(buffer);

    b.start();

    for (let i = 0; i < length; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          TestTypeSpecialized.setAtIndexed(
            view,
            i,
            j as 0 | 1 | 2 | 3,
            k as 0 | 1 | 2 | 3,
            i,
          );
        }
      }
    }

    b.end();
  },
);

Deno.bench("specialized wgpu-memory flat", { group: "Matrix writeAt" }, (b) => {
  const buffer = memory.allocate(TestTypeSpecialized, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    // deno-fmt-ignore
    TestTypeSpecialized.writeAtFlat(view, i, [
      i, i, i, i,
      i, i, i, i,
      i, i, i, i,
      i, i, i, i,
    ]);
  }

  b.end();
});

Deno.bench("specialized wgpu-memory view", { group: "Matrix writeAt" }, (b) => {
  const buffer = memory.allocate(TestTypeSpecialized, length);

  b.start();

  for (let i = 0; i < length; i++) {
    const view = TestTypeSpecialized.viewAt(buffer, i);
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        view[j * 4 + k] = i;
      }
    }
  }

  b.end();
});

Deno.bench("DataView", { group: "Matrix writeAt" }, (b) => {
  const buffer = memory.allocate(TestTypeGeneric, length);
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
  const buffer = memory.allocate(TestTypeGeneric, length);
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
