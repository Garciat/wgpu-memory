import * as memory from "../src/mod.ts";

const length = 10_000;

const TestStruct = new memory.Struct({
  u: { index: 0, type: memory.Float32 },
  v: { index: 1, type: memory.Float32 },
  w: { index: 2, type: memory.Vec2I },
  x: { index: 3, type: memory.Float32 },
});

const TextStructCompiled = memory.compileStruct(TestStruct);

Deno.bench("wgpu-memory", { group: "Struct writeAt" }, (b) => {
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

Deno.bench("wgpu-memory field views", { group: "Struct writeAt" }, (b) => {
  const buffer = memory.allocate(TestStruct, length);

  b.start();

  for (let i = 0; i < length; i++) {
    const fields = TestStruct.viewAt(buffer, i);
    fields.u[0] = i;
    fields.v[0] = i;
    fields.w[0] = i;
    fields.w[1] = i;
    fields.x[0] = i;
  }

  b.end();
});

Deno.bench("compiled wgpu-memory", { group: "Struct writeAt" }, (b) => {
  const buffer = memory.allocate(TextStructCompiled, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    TextStructCompiled.writeAt(view, i, {
      u: i,
      v: i,
      w: [i, i],
      x: i,
    });
  }

  b.end();
});

Deno.bench("compiled wgpu-memory field", { group: "Struct writeAt" }, (b) => {
  const buffer = memory.allocate(TextStructCompiled, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    TextStructCompiled.fields.u.writeAt(view, i, i);
    TextStructCompiled.fields.v.writeAt(view, i, i);
    TextStructCompiled.fields.w.writeAt(view, i, [i, i]);
    TextStructCompiled.fields.x.writeAt(view, i, i);
  }

  b.end();
});

Deno.bench(
  "compiled wgpu-memory field views",
  { group: "Struct writeAt" },
  (b) => {
    const buffer = memory.allocate(TextStructCompiled, length);

    b.start();

    for (let i = 0; i < length; i++) {
      const fields = TextStructCompiled.viewAt(buffer, i);
      fields.u[0] = i;
      fields.v[0] = i;
      fields.w[0] = i;
      fields.w[1] = i;
      fields.x[0] = i;
    }

    b.end();
  },
);

Deno.bench("DataView", { group: "Struct writeAt" }, (b) => {
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
