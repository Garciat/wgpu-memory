import * as memory from "../src/mod.ts";

const TestStruct = new memory.Struct({
  u: { index: 0, type: memory.Float32 },
  v: { index: 1, type: memory.Float32 },
  w: { index: 2, type: memory.Vec2I },
  x: { index: 3, type: memory.Float32 },
});

Deno.bench("wgpu-memory", { group: "Struct writeAt" }, (b) => {
  const length = 10_000;
  const buffer = memory.allocate(TestStruct, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    TestStruct.writeAt(view, i, {
      u: i,
      v: i,
      w: [i, i],
      x: i,
    });
  }

  b.end();
});

Deno.bench("wgpu-memory field", { group: "Struct writeAt" }, (b) => {
  const length = 10_000;
  const buffer = memory.allocate(TestStruct, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    TestStruct.fields.u.writeAt(view, i, i);
    TestStruct.fields.v.writeAt(view, i, i);
    TestStruct.fields.w.writeAt(view, i, [i, i]);
    TestStruct.fields.x.writeAt(view, i, i);
  }

  b.end();
});

Deno.bench("DataView", { group: "Struct writeAt" }, (b) => {
  const length = 10_000;
  const buffer = memory.allocate(TestStruct, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    view.setFloat32(i * 20 + 0, i, true);
    view.setFloat32(i * 20 + 4, i, true);
    view.setInt32(i * 20 + 8, i, true);
    view.setInt32(i * 20 + 12, i, true);
    view.setFloat32(i * 20 + 16, i, true);
  }

  b.end();
});

Deno.bench("TypedArray", { group: "Struct writeAt", baseline: true }, (b) => {
  const length = 10_000;
  const buffer = memory.allocate(TestStruct, length);
  const viewF = new Float32Array(buffer);
  const viewI = new Int32Array(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    viewF[i * 5 + 0] = i;
    viewF[i * 5 + 1] = i;
    viewI[i * 5 + 2] = i;
    viewI[i * 5 + 3] = i;
    viewF[i * 5 + 4] = i;
  }

  b.end();
});
