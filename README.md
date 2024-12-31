# wgpu-memory

[![jsr.io/@garciat/wgpu-memory](https://jsr.io/badges/@garciat/wgpu-memory)](https://jsr.io/@garciat/wgpu-memory)
[![jsr.io/@garciat/wgpu-memory score](https://jsr.io/badges/@garciat/wgpu-memory/score)](https://jsr.io/@garciat/wgpu-memory)

[![wgpu-memory ci](https://github.com/garciat/wgpu-memory/workflows/ci/badge.svg)](https://github.com/garciat/wgpu-memory)
[![codecov](https://codecov.io/gh/garciat/wgpu-memory/branch/main/graph/badge.svg?token=KEKZ52NXGP)](https://codecov.io/gh/garciat/wgpu-memory)

A utility library for WebGPU that provides strongly-typed `ArrayBuffer` memory
access that is compatible with [WGSL](https://gpuweb.github.io/gpuweb/wgsl/)'s
[alignment and size specifications](https://gpuweb.github.io/gpuweb/wgsl/#alignment-and-size).

Supported types are:

- [Scalar Types](https://gpuweb.github.io/gpuweb/wgsl/#scalar-types)
  - `bool`
  - `i32`
  - `u32`
  - `f32`
  - `f16` - iff [Float16](https://github.com/tc39/proposal-float16array) is
    implemented by the environment.
- [Vector Types](https://gpuweb.github.io/gpuweb/wgsl/#vector-types)
  - `vec2<T>`
  - `vec3<T>`
  - `vec4<T>`
- [Matrix Types](https://gpuweb.github.io/gpuweb/wgsl/#matrix-types)
  - `mat2x2<T>`
  - `mat3x3<T>`
  - `mat4x4<T>`
- [Array Types](https://gpuweb.github.io/gpuweb/wgsl/#array-types)
  - `array<E, N>` (fixed-size arrays)
- [Structure Types](https://gpuweb.github.io/gpuweb/wgsl/#struct-types)
  - `struct { M_1 : T_1 , ... , M_N : T_N }`

NOTE: if you're looking for a WebGPU-compatible math library, I recommend
[greggman/wgpu-matrix](https://github.com/greggman/wgpu-matrix). It also works
directly on `ArrayBuffer`s without additional object wrapping.

## Example

Importing the library:

```typescript
import * as memory from "jsr:@garciat/wgpu-memory";
```

Defining types:

```typescript
const Vertex = memory.StructOf({
  position: { index: 0, type: memory.Vec4F },
  color: { index: 1, type: memory.Vec4F },
  normal: { index: 2, type: memory.Vec3F },
  uv: { index: 3, type: memory.Vec2F },
});

const VertexQuad = memory.ArrayOf(Vertex, 6);

const CubeMesh = memory.ArrayOf(VertexQuad, 6);

const Instance = memory.StructOf({
  tint: { index: 0, type: memory.Vec4F },
  model: { index: 1, type: memory.Mat4x4F },
  mvMatrix: { index: 2, type: memory.Mat4x4F },
  normalMatrix: { index: 3, type: memory.Mat4x4F },
});
```

Using the types to allocate and write data:

```typescript
import { mat4, vec3 } from "npm:wgpu-matrix@3.3.0";

const cubeMeshData = memory.allocate(CubeMesh);
{
  const view = new DataView(cubeMeshData);

  // The input is type-checked to match the required nested shape of the data
  CubeMesh.write(view, [
    // Front face
    // deno-fmt-ignore
    [
      { position: [-1, -1, 1, 1], color: [1, 0, 0, 1], normal: [0, 0, 1], uv: [0, 0] },
      { position: [1, -1, 1, 1], color: [0, 1, 0, 1], normal: [0, 0, 1], uv: [1, 0] },
      { position: [1, 1, 1, 1], color: [0, 0, 1, 1], normal: [0, 0, 1], uv: [1, 1] },
      { position: [-1, 1, 1, 1], color: [1, 1, 1, 1], normal: [0, 0, 1], uv: [0, 1] },
      { position: [-1, -1, 1, 1], color: [1, 0, 0, 1], normal: [0, 0, 1], uv: [0, 0] },
      { position: [1, 1, 1, 1], color: [0, 0, 1, 1], normal: [0, 0, 1], uv: [1, 1] },
    ],
    // etc
  ]);
}

const cubeInstanceData = memory.allocate(Instance, 2);
{
  const view = new DataView(cubeInstanceData);

  {
    const position = vec3.fromValues(0, 0, 0);
    const scale = vec3.fromValues(0.5, 0.5, 0.5);

    // Write into the 0th instance's `tint` field
    Instance.fields.tint.writeAt(view, 0, [1, 1, 1, 1]);

    // Get a Float32Array view into the 0th instance's `model` field
    const model = Instance.fields.model.viewAt(cubeInstanceData, 0);
    // This view can be directly used with the wgpu-matrix library
    // No copying needed at all
    mat4.identity(model);
    mat4.translate(model, position, model);
    mat4.scale(model, scale, model);
  }

  {
    const position = vec3.fromValues(0, 0, -3);
    const scale = vec3.fromValues(0.05, 0.05, 0.05);

    Instance.fields.tint.writeAt(view, 1, [1, 1, 1, 1]);

    const model = Instance.fields.model.viewAt(cubeInstanceData, 1);
    mat4.identity(model);
    mat4.translate(model, position, model);
    mat4.scale(model, scale, model);
  }
}
```
