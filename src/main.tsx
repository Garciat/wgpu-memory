import { render } from "npm:preact@10.25.3";
import { useState } from "npm:preact@10.25.3/hooks";
import * as memory from "jsr:@garciat/wgpu-memory@1.0.13";

import { BinaryDumpTable } from "./binary-dump-table.tsx";
import {
  type MemoryTypeChangeEvent,
  MemoryTypeEditor,
  NullValueEditor,
  type ValueEditorComponent,
} from "./memory-type-editor.tsx";

interface AppProps {
  prop?: never;
}

const App = ({}: AppProps) => {
  const [memoryType, setMemoryType] = useState<
    memory.MemoryType<unknown, unknown, unknown>
  >(memory.Int32);

  const [ValueEditor, setValueEditor] = useState<ValueEditorComponent>(
    () => NullValueEditor,
  );

  const [data, setData] = useState(() =>
    new Int8Array(memory.allocate(memoryType))
  );

  function onMemoryTypeChange(event: MemoryTypeChangeEvent) {
    setMemoryType(event.type);
    setValueEditor(() => event.valueEditor);
    setData(new Int8Array(memory.allocate(event.type)));
  }

  function onMemoryValueChange() {
    // Force update by creating a new buffer view (does not copy the data).
    setData(new Int8Array(data.buffer));
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
        <MemoryTypeEditor onChange={onMemoryTypeChange} />
      </section>
      <h2>Type Properties</h2>
      <section>
        <pre>{
          JSON.stringify({
            byteSize: memoryType.byteSize,
            alignment: memoryType.alignment,
            arrayStride: memoryType.arrayStride,
          }, null, 2)
        }</pre>
      </section>
      <h2>Object Value</h2>
      <section>
        <ValueEditor
          view={new DataView(data.buffer)}
          onChange={onMemoryValueChange}
        />
      </section>
      <h2>WGSL (approximate)</h2>
      <section>
        <pre>{String(memoryType)}</pre>
      </section>
      <h2>JavaScript</h2>
      <section>
        <pre>{memoryType.toCode("memory")}</pre>
      </section>
      <h2>Memory View</h2>
      <section class="centered">
        <BinaryDumpTable buffer={data.buffer} />
      </section>
    </main>
  );
};

render(<App />, document.body);
