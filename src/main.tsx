import { randomBetween } from "jsr:@std/random";
import { render } from "npm:preact@10.25.3";
import * as memory from "jsr:@garciat/wgpu-memory";

import { BinaryDumpTable } from "./binary-dump-table.tsx";

interface AppProps {
  prop?: never;
}

const Vertex = new memory.Struct({
  position: { index: 0, type: memory.Vec4F },
  color: { index: 1, type: memory.Vec4F },
  normal: { index: 2, type: memory.Vec3F },
  uv: { index: 3, type: memory.Vec2F },
});

const App = (_props: AppProps) => {
  const buffer = memory.allocate(Vertex, 10);

  for (let i = 0; i < 10; i++) {
    const vertex = Vertex.viewAt(buffer, i);
    vertex.position.set([
      randomBetween(-1, 1),
      randomBetween(-1, 1),
      randomBetween(-1, 1),
      1,
    ]);
    vertex.color.set([1, 0, 0, 1]);
    vertex.normal.set([-1, -1, NaN]);
    vertex.uv.set([NaN, NaN]);
  }

  return (
    <main>
      <div>{Vertex.toString()}</div>
      <div>{`Byte Size: ${Vertex.byteSize}`}</div>
      <div>{`Alignment: ${Vertex.alignment}`}</div>
      <div>{`Array Stride: ${Vertex.arrayStride}`}</div>
      <BinaryDumpTable buffer={buffer} />
    </main>
  );
};

render(<App />, document.body);
