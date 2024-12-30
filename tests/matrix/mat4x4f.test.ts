import { assertEquals } from "jsr:@std/assert";

import { Mat4x4F } from "../../src/matrix/mat4x4f.ts";

import * as memory from "../../src/mod.ts";

const TestOffset = 16;

const TypeName = "Mat4x4F";

const M = new Mat4x4F();

const TypedArray = Float32Array;

const TestMatrix1 = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
] as const;

const TestMatrix2 = [
  [17, 18, 19, 20],
  [21, 22, 23, 24],
  [25, 26, 27, 28],
  [29, 30, 31, 32],
] as const;

// deno-fmt-ignore
const TestMatrixFlat1 = [
  1, 2, 3, 4,
  5, 6, 7, 8,
  9, 10, 11, 12,
  13, 14, 15, 16,
] as const;

// deno-fmt-ignore
const TestMatrixFlat2 = [
  17, 18, 19, 20,
  21, 22, 23, 24,
  25, 26, 27, 28,
  29, 30, 31, 32,
] as const;

// deno-fmt-ignore
const TestMatrixData1 = [
  1, 2, 3, 4,
  5, 6, 7, 8,
  9, 10, 11, 12,
  13, 14, 15, 16,
] as const;

// deno-fmt-ignore
const TestMatrixData2 = [
  17, 18, 19, 20,
  21, 22, 23, 24,
  25, 26, 27, 28,
  29, 30, 31, 32,
] as const;

const MatrixByteSize = 64;

const MatrixAlignment = 16;

const MatrixArrayStride = 64;

const MatrixColumnCount = 4;

const MatrixRowCount = 4;

const ComponentTypeSize = 4;

function read(buffer: ArrayBuffer, offset: number): number {
  return new DataView(buffer).getFloat32(offset, true);
}

Deno.test(`${TypeName}.shape`, () => {
  assertEquals(M.shape, [MatrixColumnCount, MatrixRowCount]);
});

Deno.test(`${TypeName}.componentType`, () => {
  assertEquals(M.componentType, memory.Float32);
});

Deno.test(`${TypeName}.toString`, () => {
  assertEquals(String(M), "mat4x4<f32>");
});

Deno.test(`${TypeName}.toCode`, () => {
  assertEquals(M.toCode("memory"), "memory.Mat4x4F");
});

Deno.test(`${TypeName}.type`, () => {
  assertEquals(M.type, "mat4x4");
});

Deno.test(`${TypeName}.byteSize`, () => {
  assertEquals(M.byteSize, MatrixByteSize);
});

Deno.test(`${TypeName}.alignment`, () => {
  assertEquals(M.alignment, MatrixAlignment);
});

Deno.test(`${TypeName}.arrayStride`, () => {
  assertEquals(M.arrayStride, MatrixArrayStride);
});

Deno.test(`${TypeName}.read`, () => {
  const buffer = new ArrayBuffer(TestOffset + MatrixArrayStride);

  new TypedArray(buffer, TestOffset).set(TestMatrixData1);

  {
    const view = new DataView(buffer, TestOffset);
    assertEquals(M.read(view), TestMatrix1);
  }

  {
    const view = new DataView(buffer);
    assertEquals(M.read(view, TestOffset), TestMatrix1);
  }
});

Deno.test(`${TypeName}.write`, () => {
  {
    const buffer = new ArrayBuffer(TestOffset + MatrixArrayStride);
    const view = new DataView(buffer, TestOffset);

    M.write(view, TestMatrix1);

    assertEquals(
      new TypedArray(buffer, TestOffset),
      new TypedArray(TestMatrixData1),
    );
  }

  {
    const buffer = new ArrayBuffer(TestOffset + MatrixArrayStride);
    const view = new DataView(buffer);

    M.write(view, TestMatrix1, TestOffset);

    assertEquals(
      new TypedArray(buffer, TestOffset),
      new TypedArray(TestMatrixData1),
    );
  }
});

Deno.test(`${TypeName}.readAt`, () => {
  const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);

  new TypedArray(buffer, TestOffset).set([
    ...TestMatrixData1,
    ...TestMatrixData2,
  ]);

  {
    const view = new DataView(buffer, TestOffset);
    assertEquals(M.readAt(view, 0), TestMatrix1);
    assertEquals(M.readAt(view, 1), TestMatrix2);
  }

  {
    const view = new DataView(buffer);
    assertEquals(M.readAt(view, 0, TestOffset), TestMatrix1);
    assertEquals(M.readAt(view, 1, TestOffset), TestMatrix2);
  }
});

Deno.test(`${TypeName}.writeAt`, () => {
  {
    const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);
    const view = new DataView(buffer, TestOffset);

    M.writeAt(view, 0, TestMatrix1);
    M.writeAt(view, 1, TestMatrix2);

    assertEquals(
      new TypedArray(buffer, TestOffset),
      new TypedArray([
        ...TestMatrixData1,
        ...TestMatrixData2,
      ]),
    );
  }

  {
    const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);
    const view = new DataView(buffer);

    M.writeAt(view, 0, TestMatrix1, TestOffset);

    M.writeAt(view, 1, TestMatrix2, TestOffset);

    assertEquals(
      new TypedArray(buffer, TestOffset),
      new TypedArray([
        ...TestMatrixData1,
        ...TestMatrixData2,
      ]),
    );
  }
});

Deno.test(`${TypeName}.readAtFlat`, () => {
  const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);

  new TypedArray(buffer, TestOffset).set([
    ...TestMatrixData1,
    ...TestMatrixData2,
  ]);

  {
    const view = new DataView(buffer, TestOffset);
    assertEquals(M.readAtFlat(view, 0), TestMatrixFlat1);
    assertEquals(M.readAtFlat(view, 1), TestMatrixFlat2);
  }

  {
    const view = new DataView(buffer);
    assertEquals(M.readAtFlat(view, 0, TestOffset), TestMatrixFlat1);
    assertEquals(M.readAtFlat(view, 1, TestOffset), TestMatrixFlat2);
  }
});

Deno.test(`${TypeName}.writeAtFlat`, () => {
  {
    const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);
    const view = new DataView(buffer, TestOffset);

    M.writeAtFlat(view, 0, TestMatrixFlat1);
    M.writeAtFlat(view, 1, TestMatrixFlat2);

    assertEquals(
      new TypedArray(buffer, TestOffset),
      new TypedArray([
        ...TestMatrixData1,
        ...TestMatrixData2,
      ]),
    );
  }

  {
    const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);
    const view = new DataView(buffer);

    // deno-fmt-ignore
    M.writeAtFlat(view, 0, TestMatrixFlat1, TestOffset);

    // deno-fmt-ignore
    M.writeAtFlat(view, 1, TestMatrixFlat2, TestOffset);

    assertEquals(
      new TypedArray(buffer, TestOffset),
      new TypedArray([
        ...TestMatrixData1,
        ...TestMatrixData2,
      ]),
    );
  }
});

Deno.test(`${TypeName}.view`, () => {
  const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);

  new TypedArray(buffer, TestOffset).set([
    ...TestMatrixData1,
    ...TestMatrixData2,
  ]);

  assertEquals(
    M.view(buffer, TestOffset),
    new TypedArray(TestMatrixData1),
  );

  assertEquals(
    M.view(buffer, TestOffset, 1),
    new TypedArray(TestMatrixData1),
  );

  assertEquals(
    M.view(buffer, TestOffset, 2),
    new TypedArray([
      ...TestMatrixData1,
      ...TestMatrixData2,
    ]),
  );
});

Deno.test(`${TypeName}.viewAt`, () => {
  const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);

  new TypedArray(buffer, TestOffset).set([
    ...TestMatrixData1,
    ...TestMatrixData2,
  ]);

  assertEquals(
    M.viewAt(buffer, 0, TestOffset),
    new TypedArray(TestMatrixData1),
  );

  assertEquals(
    M.viewAt(buffer, 1, TestOffset),
    new TypedArray(TestMatrixData2),
  );
});

Deno.test(`${TypeName}.get`, () => {
  const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);

  // deno-fmt-ignore
  new TypedArray(buffer, TestOffset).set([
    ...TestMatrixData1,
    ...TestMatrixData2,
  ]);

  {
    const view = new DataView(buffer, TestOffset);
    assertEquals(M.get(view, [0, 1]), 2);
    assertEquals(M.get(view, [1, 1]), MatrixRowCount + 2);
  }

  {
    const view = new DataView(buffer);
    assertEquals(M.get(view, [0, 1], TestOffset), 2);
    assertEquals(M.get(view, [1, 1], TestOffset), MatrixRowCount + 2);
  }
});

Deno.test(`${TypeName}.set`, () => {
  {
    const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);
    const view = new DataView(buffer, TestOffset);

    M.set(view, [0, 1], 42);

    assertEquals(
      read(buffer, TestOffset + ComponentTypeSize),
      42,
    );
  }

  {
    const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);
    const view = new DataView(buffer);

    M.set(view, [1, 1], 42, TestOffset);

    assertEquals(
      read(
        buffer,
        TestOffset +
          1 * MatrixAlignment +
          ComponentTypeSize,
      ),
      42,
    );
  }
});

Deno.test(`${TypeName}.offset`, () => {
  assertEquals(
    M.offset([1, 1]),
    1 * MatrixAlignment + ComponentTypeSize,
  );
});

Deno.test(`${TypeName}.getAt`, () => {
  const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);

  // deno-fmt-ignore
  new TypedArray(buffer, TestOffset).set([
    ...TestMatrixData1,
    ...TestMatrixData2,
  ]);

  {
    const view = new DataView(buffer, TestOffset);
    assertEquals(M.getAt(view, 1, 1), MatrixRowCount + 2);
  }

  {
    const view = new DataView(buffer);
    assertEquals(M.getAt(view, 1, 1, TestOffset), MatrixRowCount + 2);
  }
});

Deno.test(`${TypeName}.setAt`, () => {
  {
    const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);
    const view = new DataView(buffer, TestOffset);

    M.setAt(view, 1, 1, 42);

    assertEquals(
      read(
        buffer,
        TestOffset +
          1 * MatrixAlignment +
          ComponentTypeSize,
      ),
      42,
    );
  }

  {
    const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);
    const view = new DataView(buffer);

    M.setAt(view, 1, 1, 42, TestOffset);

    assertEquals(
      read(
        buffer,
        TestOffset +
          1 * MatrixAlignment +
          ComponentTypeSize,
      ),
      42,
    );
  }
});

Deno.test(`${TypeName}.getAtIndexed`, () => {
  const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);

  // deno-fmt-ignore
  new TypedArray(buffer, TestOffset).set([
    ...TestMatrixData1,
    ...TestMatrixData2,
  ]);

  {
    const view = new DataView(buffer, TestOffset);
    assertEquals(M.getAtIndexed(view, 0, 1, 1), MatrixRowCount + 2);
  }

  {
    const view = new DataView(buffer);
    assertEquals(
      M.getAtIndexed(view, 1, 1, 1, TestOffset),
      MatrixColumnCount * MatrixRowCount + MatrixRowCount + 2,
    );
  }
});

Deno.test(`${TypeName}.setAtIndexed`, () => {
  {
    const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);
    const view = new DataView(buffer, TestOffset);

    M.setAtIndexed(view, 0, 1, 1, 42);

    assertEquals(
      read(
        buffer,
        TestOffset +
          1 * MatrixAlignment +
          ComponentTypeSize,
      ),
      42,
    );
  }

  {
    const buffer = new ArrayBuffer(TestOffset + 2 * MatrixArrayStride);
    const view = new DataView(buffer);

    M.setAtIndexed(view, 1, 1, 1, 42, TestOffset);

    assertEquals(
      read(
        buffer,
        TestOffset +
          MatrixArrayStride +
          1 * MatrixAlignment +
          ComponentTypeSize,
      ),
      42,
    );
  }
});
