import { render } from "npm:preact@10.25.3";
import { useState } from "npm:preact@10.25.3/hooks";
import * as memory from "jsr:@garciat/wgpu-memory@1.0.14";

import { BinaryDumpTable } from "./binary-dump-table.tsx";
import {
  type MemoryTypeChangeEvent,
  MemoryTypeEditor,
} from "./memory-type-editor.tsx";
import { MemoryValueEditor } from "./memory-value-editor.tsx";

const DefaultType = new memory.Struct({
  u: { index: 0, type: memory.Float32 },
  v: { index: 1, type: memory.Float32 },
  w: { index: 2, type: memory.Vec2F },
  x: { index: 3, type: memory.Float32 },
});

const ArrayBufferConstructor = globalThis.ArrayBuffer as unknown as {
  new (
    byteLength: number,
    options?: { maxByteLength: number },
  ): ArrayBuffer & {
    resize(byteLength: number): void;
  };
};

const buffer = new ArrayBufferConstructor(DefaultType.byteSize, {
  maxByteLength: 4 * 1024 * 1024,
});

interface AppProps {
  prop?: never;
}

const App = ({}: AppProps) => {
  const [memoryType, setMemoryType] = useState<
    memory.MemoryType<unknown, unknown, unknown>
  >(DefaultType);

  const [bytes, setBytes] = useState(() => new Uint8Array(buffer));

  function onMemoryTypeChange(event: MemoryTypeChangeEvent) {
    setMemoryType(event.type);
    buffer.resize(event.type.byteSize);
    setBytes(new Uint8Array(buffer));
  }

  function onMemoryValueChange() {
    // Force update by creating a new buffer view (does not copy the data).
    setBytes(new Uint8Array(buffer));
  }

  return (
    <main>
      <h1>wgpu-memory</h1>
      <p>
        A utility library for WebGPU that provides strongly-typed{" "}
        <code>ArrayBuffer</code> memory access that is compatible with{" "}
        <a href="https://gpuweb.github.io/gpuweb/wgsl/">
          WGSL
        </a>'s{" "}
        <a href="https://gpuweb.github.io/gpuweb/wgsl/#alignment-and-size">
          alignment and size specifications
        </a>.
      </p>
      <p>Below you may use a visual editor for the supported memory types.</p>
      <h2>Memory Type</h2>
      <section>
        <MemoryTypeEditor type={memoryType} onChange={onMemoryTypeChange} />
      </section>
      <h2>Type Properties</h2>
      <section>
        <pre>{
          JSON.stringify({
            byteSize: memoryType.byteSize,
            alignment: memoryType.alignment,
            arrayStride: memoryType.arrayStride,
          })
        }</pre>
      </section>
      <h2>WGSL (approximate)</h2>
      <section>
        <pre>{String(memoryType)}</pre>
      </section>
      <h2>JavaScript</h2>
      <section class="centered">
        <pre class="syntax-highlight">
          {`import * as memory from "jsr:@garciat/wgpu-memory@1.0.14";\n\n`}
          {`const myType = ${memoryType.toCode("memory")};`}
        </pre>
      </section>
      <h2>Object Value</h2>
      <section class="object-value-container">
        <MemoryValueEditor
          type={memoryType}
          buffer={bytes.buffer}
          offset={0}
          onChange={onMemoryValueChange}
        />
      </section>
      <h2>Memory View</h2>
      <section class="centered">
        <BinaryDumpTable bytes={bytes} />
      </section>
    </main>
  );
};

render(<App />, document.body);
