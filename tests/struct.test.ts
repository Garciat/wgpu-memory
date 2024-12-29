import { assertEquals, assertThrows } from "jsr:@std/assert";

import * as memory from "../src/mod.ts";

Deno.test("Struct", () => {
  const StructA = new memory.Struct({
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
      "new memory.Struct({",
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
  const StructA = new memory.Struct({
    u: { index: 0, type: memory.Float32 },
    v: { index: 1, type: memory.Float32 },
    w: { index: 2, type: memory.Vec2F },
    x: { index: 3, type: memory.Float32 },
  });

  const StructB = memory.compileStruct(StructA);

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