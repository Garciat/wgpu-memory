import * as memory from "../src/mod.ts";

const length = 100_000;

Deno.bench("wgpu-memory", { group: "Vec4F writeAt" }, (b) => {
  const buffer = memory.allocate(memory.Vec4F, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    memory.Vec4F.writeAt(view, i, [i, i, i, i]);
  }

  b.end();
});

Deno.bench("DataView", { group: "Vec4F writeAt" }, (b) => {
  const buffer = memory.allocate(memory.Vec4F, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    view.setFloat32(i * 16 + 0, i, true);
    view.setFloat32(i * 16 + 4, i, true);
    view.setFloat32(i * 16 + 8, i, true);
    view.setFloat32(i * 16 + 12, i, true);
  }

  b.end();
});

Deno.bench("TypedArray", { group: "Vec4F writeAt", baseline: true }, (b) => {
  const buffer = memory.allocate(memory.Vec4F, length);
  const view = new Float32Array(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    view[i * 4 + 0] = i;
    view[i * 4 + 1] = i;
    view[i * 4 + 2] = i;
    view[i * 4 + 3] = i;
  }

  b.end();
});
