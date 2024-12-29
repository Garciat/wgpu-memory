import * as memory from "../src/mod.ts";

const ENDIANNESS = [
  "BIG" as const,
  "LITTLE" as const,
][new Uint8Array(new Uint16Array([1]).buffer)[0]];

console.error("System Endianness:", ENDIANNESS);

const length = 100_000;

Deno.bench("wgpu-memory", { group: "Float32 writeAt" }, (b) => {
  const buffer = memory.allocate(memory.Float32, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    memory.Float32.writeAt(view, i, i);
  }

  b.end();
});

Deno.bench("DataView", { group: "Float32 writeAt" }, (b) => {
  const buffer = memory.allocate(memory.Float32, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    view.setFloat32(i * 4, i, true);
  }

  b.end();
});

Deno.bench("TypedArray", { group: "Float32 writeAt", baseline: true }, (b) => {
  const buffer = memory.allocate(memory.Float32, length);
  const view = new Float32Array(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    view[i] = i;
  }

  b.end();
});

Deno.bench("wgpu-memory", { group: "Int32 writeAt" }, (b) => {
  const buffer = memory.allocate(memory.Int32, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    memory.Int32.writeAt(view, i, i);
  }

  b.end();
});

Deno.bench("DataView", { group: "Int32 writeAt" }, (b) => {
  const buffer = memory.allocate(memory.Int32, length);
  const view = new DataView(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    view.setInt32(i * 4, i, true);
  }

  b.end();
});

Deno.bench("TypedArray", { group: "Int32 writeAt", baseline: true }, (b) => {
  const buffer = memory.allocate(memory.Int32, length);
  const view = new Int32Array(buffer);

  b.start();

  for (let i = 0; i < length; i++) {
    view[i] = i;
  }

  b.end();
});
