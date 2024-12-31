import { assertEquals, assertThrows } from "jsr:@std/assert";

import * as memory from "../src/mod.ts";

Deno.test("Struct", () => {
  const StructA = memory.StructOf({
    u: { index: 0, type: memory.Float32 },
    v: { index: 1, type: memory.Float32 },
    w: { index: 2, type: memory.Vec2F },
    x: { index: 3, type: memory.Float32 },
  });

  assertEquals(
    String(StructA),
    "struct { u: f32, v: f32, w: vec2<f32>, x: f32 }",
  );
  assertEquals(
    StructA.toCode("memory"),
    [
      "memory.StructOf({",
      "  u: { index: 0, type: memory.Float32 },",
      "  v: { index: 1, type: memory.Float32 },",
      "  w: { index: 2, type: memory.Vec2F },",
      "  x: { index: 3, type: memory.Float32 },",
      "})",
    ].join("\n"),
  );
  assertEquals(StructA.type, "struct");
  assertEquals(StructA.byteSize, 24);
  assertEquals(StructA.alignment, 8);

  assertEquals(StructA.fields.u.name, "u");
  assertEquals(StructA.fields.u.index, 0);
  assertEquals(StructA.fields.u.type, memory.Float32);
  assertEquals(StructA.fields.u.offset, 0);
  assertEquals(StructA.fields.u.alignment, 4);
  assertEquals(StructA.fields.u.byteSize, 4);

  assertEquals(StructA.fields.v.name, "v");
  assertEquals(StructA.fields.v.index, 1);
  assertEquals(StructA.fields.v.type, memory.Float32);
  assertEquals(StructA.fields.v.offset, 4);
  assertEquals(StructA.fields.v.alignment, 4);
  assertEquals(StructA.fields.v.byteSize, 4);

  assertEquals(StructA.fields.w.name, "w");
  assertEquals(StructA.fields.w.index, 2);
  assertEquals(StructA.fields.w.type, memory.Vec2F);
  assertEquals(StructA.fields.w.offset, 8);
  assertEquals(StructA.fields.w.alignment, 8);
  assertEquals(StructA.fields.w.byteSize, 8);

  assertEquals(StructA.fields.x.name, "x");
  assertEquals(StructA.fields.x.index, 3);
  assertEquals(StructA.fields.x.type, memory.Float32);
  assertEquals(StructA.fields.x.offset, 16);
  assertEquals(StructA.fields.x.alignment, 4);
  assertEquals(StructA.fields.x.byteSize, 4);

  const buffer = memory.allocate(StructA, 2);
  assertEquals(buffer.byteLength, 48);

  const view = new DataView(buffer);

  assertEquals(StructA.readAt(view, 0), {
    u: 0,
    v: 0,
    w: [0, 0],
    x: 0,
  });
  assertEquals(StructA.readAt(view, 1), {
    u: 0,
    v: 0,
    w: [0, 0],
    x: 0,
  });
  assertThrows(() => StructA.readAt(view, 2), RangeError);

  StructA.write(view, { u: 1, v: 2, w: [3, 4], x: 5 });
  assertEquals(StructA.read(view), { u: 1, v: 2, w: [3, 4], x: 5 });

  StructA.writeAt(view, 1, { u: 6, v: 7, w: [8, 9], x: 10 });
  assertEquals(StructA.readAt(view, 1), { u: 6, v: 7, w: [8, 9], x: 10 });

  StructA.fields.w.write(view, [40, 50]);
  assertEquals(StructA.fields.w.read(view, 0), [40, 50]);

  StructA.fields.w.writeAt(view, 1, [60, 70]);
  assertEquals(StructA.fields.w.readAt(view, 1), [60, 70]);

  assertEquals(
    StructA.viewAt(buffer, 0),
    {
      u: new Float32Array([1]),
      v: new Float32Array([2]),
      w: new Float32Array([40, 50]),
      x: new Float32Array([5]),
    },
  );

  assertEquals(
    StructA.viewAt(buffer, 1),
    {
      u: new Float32Array([6]),
      v: new Float32Array([7]),
      w: new Float32Array([60, 70]),
      x: new Float32Array([10]),
    },
  );

  assertEquals(
    StructA.fields.w.viewAt(buffer, 1),
    new Float32Array([60, 70]),
  );

  assertEquals(
    new Float32Array(buffer),
    // deno-fmt-ignore
    new Float32Array([
      1, 2, 40, 50, 5, 0,
      6, 7, 60, 70, 10, 0,
    ]),
  );

  assertThrows(() => StructA.view(buffer), TypeError);
});

Deno.test("compile", () => {
  const StructA = memory.StructOf({
    u: { index: 0, type: memory.Float32 },
    v: { index: 1, type: memory.Float32 },
    w: { index: 2, type: memory.Vec2F },
    x: { index: 3, type: memory.Float32 },
  });

  const StructB = memory.StructOf({
    u: { index: 0, type: memory.Float32 },
    v: { index: 1, type: memory.Float32 },
    w: { index: 2, type: memory.Vec2F },
    x: { index: 3, type: memory.Float32 },
  }, { compile: true });

  const source = (StructB as unknown as { __source: string }).__source;
  assertEquals(source, CompiledStructSource1);

  assertEquals(String(StructB), String(StructA));
  assertEquals(StructB.toCode("memory"), StructA.toCode("memory"));

  assertEquals(StructB.type, StructA.type);
  assertEquals(StructB.byteSize, StructA.byteSize);
  assertEquals(StructB.alignment, StructA.alignment);
  assertEquals(StructB.arrayStride, StructA.arrayStride);

  assertEquals(StructB.fields.u.name, StructA.fields.u.name);
  assertEquals(StructB.fields.u.index, StructA.fields.u.index);
  assertEquals(StructB.fields.u.type, StructA.fields.u.type);
  assertEquals(StructB.fields.u.offset, StructA.fields.u.offset);
  assertEquals(StructB.fields.u.alignment, StructA.fields.u.alignment);
  assertEquals(StructB.fields.u.byteSize, StructA.fields.u.byteSize);

  assertEquals(StructB.fields.v.name, StructA.fields.v.name);
  assertEquals(StructB.fields.v.index, StructA.fields.v.index);
  assertEquals(StructB.fields.v.type, StructA.fields.v.type);
  assertEquals(StructB.fields.v.offset, StructA.fields.v.offset);
  assertEquals(StructB.fields.v.alignment, StructA.fields.v.alignment);
  assertEquals(StructB.fields.v.byteSize, StructA.fields.v.byteSize);

  assertEquals(StructB.fields.w.name, StructA.fields.w.name);
  assertEquals(StructB.fields.w.index, StructA.fields.w.index);
  assertEquals(StructB.fields.w.type, StructA.fields.w.type);
  assertEquals(StructB.fields.w.offset, StructA.fields.w.offset);
  assertEquals(StructB.fields.w.alignment, StructA.fields.w.alignment);
  assertEquals(StructB.fields.w.byteSize, StructA.fields.w.byteSize);

  assertEquals(StructB.fields.x.name, StructA.fields.x.name);
  assertEquals(StructB.fields.x.index, StructA.fields.x.index);
  assertEquals(StructB.fields.x.type, StructA.fields.x.type);
  assertEquals(StructB.fields.x.offset, StructA.fields.x.offset);
  assertEquals(StructB.fields.x.alignment, StructA.fields.x.alignment);
  assertEquals(StructB.fields.x.byteSize, StructA.fields.x.byteSize);

  const buffer = memory.allocate(StructB, 2);
  const view = new DataView(buffer);

  StructA.writeAt(view, 0, { u: 1, v: 2, w: [3, 4], x: 5 });
  StructA.writeAt(view, 1, { u: 6, v: 7, w: [8, 9], x: 10 });

  assertEquals(StructB.readAt(view, 0), StructA.readAt(view, 0));
  assertEquals(StructB.readAt(view, 1), StructA.readAt(view, 1));

  assertEquals(StructB.viewAt(buffer, 0), StructA.viewAt(buffer, 0));
  assertEquals(StructB.viewAt(buffer, 1), StructA.viewAt(buffer, 1));

  assertEquals(
    StructB.fields.u.readAt(view, 0),
    StructA.fields.u.readAt(view, 0),
  );
  assertEquals(
    StructB.fields.v.readAt(view, 0),
    StructA.fields.v.readAt(view, 0),
  );
  assertEquals(
    StructB.fields.w.readAt(view, 0),
    StructA.fields.w.readAt(view, 0),
  );
  assertEquals(
    StructB.fields.x.readAt(view, 0),
    StructA.fields.x.readAt(view, 0),
  );

  assertEquals(
    StructB.fields.u.viewAt(buffer, 0),
    StructA.fields.u.viewAt(buffer, 0),
  );
  assertEquals(
    StructB.fields.v.viewAt(buffer, 0),
    StructA.fields.v.viewAt(buffer, 0),
  );
  assertEquals(
    StructB.fields.w.viewAt(buffer, 0),
    StructA.fields.w.viewAt(buffer, 0),
  );
  assertEquals(
    StructB.fields.x.viewAt(buffer, 0),
    StructA.fields.x.viewAt(buffer, 0),
  );

  assertEquals(
    StructB.fields.u.readAt(view, 1),
    StructA.fields.u.readAt(view, 1),
  );
  assertEquals(
    StructB.fields.v.readAt(view, 1),
    StructA.fields.v.readAt(view, 1),
  );
  assertEquals(
    StructB.fields.w.readAt(view, 1),
    StructA.fields.w.readAt(view, 1),
  );
  assertEquals(
    StructB.fields.x.readAt(view, 1),
    StructA.fields.x.readAt(view, 1),
  );

  assertEquals(
    StructB.fields.u.viewAt(buffer, 1),
    StructA.fields.u.viewAt(buffer, 1),
  );
  assertEquals(
    StructB.fields.v.viewAt(buffer, 1),
    StructA.fields.v.viewAt(buffer, 1),
  );
  assertEquals(
    StructB.fields.w.viewAt(buffer, 1),
    StructA.fields.w.viewAt(buffer, 1),
  );
  assertEquals(
    StructB.fields.x.viewAt(buffer, 1),
    StructA.fields.x.viewAt(buffer, 1),
  );
});

const CompiledStructSource1 = `
class GeneratedStruct {
  static fields = Object.freeze({
u: class GeneratedFieldAccessor {
  static get index() {
    return 0;
  }

  static get name() {
    return "u";
  }

  static get type() {
    return param_fieldType_u;
  }

  static get byteSize() {
    return 4;
  }

  static get alignment() {
    return 4;
  }

  static get offset() {
    return 0;
  }

  static read(view, offset = 0) {
    return param_fieldType_u.read(view, 0 + offset);
  }

  static write(view, value, offset = 0) {
    param_fieldType_u.write(view, value, 0 + offset);
  }

  static readAt(view, index, offset = 0) {
    return param_fieldType_u.read(view, index * 24 + 0 + offset);
  }

  static writeAt(view, index, value, offset = 0) {
    param_fieldType_u.write(view, value, index * 24 + 0 + offset);
  }

  static viewAt(buffer, index, offset = 0) {
    return param_fieldType_u.viewAt(buffer, 0, index * 24 + 0 + offset);
  }
},
v: class GeneratedFieldAccessor {
  static get index() {
    return 1;
  }

  static get name() {
    return "v";
  }

  static get type() {
    return param_fieldType_v;
  }

  static get byteSize() {
    return 4;
  }

  static get alignment() {
    return 4;
  }

  static get offset() {
    return 4;
  }

  static read(view, offset = 0) {
    return param_fieldType_v.read(view, 4 + offset);
  }

  static write(view, value, offset = 0) {
    param_fieldType_v.write(view, value, 4 + offset);
  }

  static readAt(view, index, offset = 0) {
    return param_fieldType_v.read(view, index * 24 + 4 + offset);
  }

  static writeAt(view, index, value, offset = 0) {
    param_fieldType_v.write(view, value, index * 24 + 4 + offset);
  }

  static viewAt(buffer, index, offset = 0) {
    return param_fieldType_v.viewAt(buffer, 0, index * 24 + 4 + offset);
  }
},
w: class GeneratedFieldAccessor {
  static get index() {
    return 2;
  }

  static get name() {
    return "w";
  }

  static get type() {
    return param_fieldType_w;
  }

  static get byteSize() {
    return 8;
  }

  static get alignment() {
    return 8;
  }

  static get offset() {
    return 8;
  }

  static read(view, offset = 0) {
    return param_fieldType_w.read(view, 8 + offset);
  }

  static write(view, value, offset = 0) {
    param_fieldType_w.write(view, value, 8 + offset);
  }

  static readAt(view, index, offset = 0) {
    return param_fieldType_w.read(view, index * 24 + 8 + offset);
  }

  static writeAt(view, index, value, offset = 0) {
    param_fieldType_w.write(view, value, index * 24 + 8 + offset);
  }

  static viewAt(buffer, index, offset = 0) {
    return param_fieldType_w.viewAt(buffer, 0, index * 24 + 8 + offset);
  }
},
x: class GeneratedFieldAccessor {
  static get index() {
    return 3;
  }

  static get name() {
    return "x";
  }

  static get type() {
    return param_fieldType_x;
  }

  static get byteSize() {
    return 4;
  }

  static get alignment() {
    return 4;
  }

  static get offset() {
    return 16;
  }

  static read(view, offset = 0) {
    return param_fieldType_x.read(view, 16 + offset);
  }

  static write(view, value, offset = 0) {
    param_fieldType_x.write(view, value, 16 + offset);
  }

  static readAt(view, index, offset = 0) {
    return param_fieldType_x.read(view, index * 24 + 16 + offset);
  }

  static writeAt(view, index, value, offset = 0) {
    param_fieldType_x.write(view, value, index * 24 + 16 + offset);
  }

  static viewAt(buffer, index, offset = 0) {
    return param_fieldType_x.viewAt(buffer, 0, index * 24 + 16 + offset);
  }
},
});

  static toString() {
    return "struct { u: f32, v: f32, w: vec2<f32>, x: f32 }";
  }

  static toCode(namespace, indentation=0) {
    return param_toCodeImpl(this, namespace, indentation);
  }

  static get type() {
    return "struct";
  }

  static get byteSize() {
    return 24;
  }

  static get alignment() {
    return 8;
  }

  static get arrayStride() {
    return 24;
  }

  static read(view, offset = 0) {
    return {
u: param_fieldType_u.read(view, 0 + offset),
v: param_fieldType_v.read(view, 4 + offset),
w: param_fieldType_w.read(view, 8 + offset),
x: param_fieldType_x.read(view, 16 + offset),
};
  }

  static write(view, values, offset = 0) {
    param_fieldType_u.write(view, values.u, 0 + offset);
param_fieldType_v.write(view, values.v, 4 + offset);
param_fieldType_w.write(view, values.w, 8 + offset);
param_fieldType_x.write(view, values.x, 16 + offset);
  }

  static readAt(view, index, offset = 0) {
    return this.read(view, index * 24 + offset);
  }

  static writeAt(view, index, value, offset = 0) {
    this.write(view, value, index * 24 + offset);
  }

  static viewAt(buffer, index, offset = 0) {
    const effectiveOffset = index * 24 + offset;
    return {
u: param_fieldType_u.viewAt(buffer, 0, 0 + effectiveOffset),
v: param_fieldType_v.viewAt(buffer, 0, 4 + effectiveOffset),
w: param_fieldType_w.viewAt(buffer, 0, 8 + effectiveOffset),
x: param_fieldType_x.viewAt(buffer, 0, 16 + effectiveOffset),
};
  }
}
`.trim();
