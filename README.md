# wgpu-memory

[![jsr.io/@garciat/wgpu-memory](https://jsr.io/badges/@garciat/wgpu-memory)](https://jsr.io/@garciat/wgpu-memory)
[![jsr.io/@garciat/wgpu-memory score](https://jsr.io/badges/@garciat/wgpu-memory/score)](https://jsr.io/@garciat/wgpu-memory)
<!-- [![npm Version](https://img.shields.io/npm/v/@garciat/wgpu-memory)](https://www.npmjs.com/package/@garciat/wgpu-memory) -->

[![wgpu-memory ci](https://github.com/garciat/wgpu-memory/workflows/ci/badge.svg)](https://github.com/garciat/wgpu-memory)
[![codecov](https://codecov.io/gh/garciat/wgpu-memory/branch/main/graph/badge.svg?token=KEKZ52NXGP)](https://codecov.io/gh/garciat/wgpu-memory)

## Example

Importing the library:

```typescript
import * as memory from 'jsr:@garciat/wgpu-memory';
```

Defining types:

```typescript
const Vertex = new memory.Struct({
  position: { index: 0, type: memory.Vec4F },
  color: { index: 1, type: memory.Vec4F },
  normal: { index: 2, type: memory.Vec3F },
  uv: { index: 3, type: memory.Vec2F },
});

const VertexQuad = new memory.ArrayType(Vertex, 6);

const CubeMesh = new memory.ArrayType(VertexQuad, 6);

const Instance = new memory.Struct({
  tint: { index: 0, type: memory.Vec4F },
  model: { index: 1, type: memory.Mat4x4F },
  mvMatrix: { index: 2, type: memory.Mat4x4F },
  normalMatrix: { index: 3, type: memory.Mat4x4F },
});
```

Using the types to allocate and write data:

```typescript
const cubeMeshData = memory.allocate(CubeMesh);
{
  const view = new DataView(cubeMeshData);

  CubeMesh.write(view, [
    // Front face
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

    Instance.fields.tint.writeAt(view, 0, [1, 1, 1, 1]);

    const model = Instance.fields.model.view(cubeInstanceData, 0);
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
