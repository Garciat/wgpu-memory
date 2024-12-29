import { render } from "npm:preact@10.25.3";
import { useState } from "npm:preact@10.25.3/hooks";
import hljs from "npm:highlight.js@11.11.1/lib/core";
import hljsLangJSON from "npm:highlight.js@11.11.1/lib/languages/javascript";
import hljsLangJS from "npm:highlight.js@11.11.1/lib/languages/javascript";
import hljsLangWGSL from "./vendored/highlightjs-wgsl.js";

hljs.registerLanguage("json", hljsLangJSON);
hljs.registerLanguage("javascript", hljsLangJS);
hljs.registerLanguage("wgsl", hljsLangWGSL);

import * as memory from "jsr:@garciat/wgpu-memory@1.0.14";

import "./float16-polyfill.ts";

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
    <>
      <p>
        Below you may use a visual editor for the supported memory types.
      </p>
      <h2>Memory Type</h2>
      <p class="warning" hidden={"Float16Array" in globalThis}>
        <strong>Note:</strong> Your JavaScript environment does not support{" "}
        <a href="https://tc39.es/proposal-float16array/">Float 16</a>. If you
        use <code>f16</code> below, then the page will stop working.
      </p>
      <section class="centered">
        <MemoryTypeEditor type={memoryType} onChange={onMemoryTypeChange} />
      </section>
      <section class="centered">
        <pre
          class="syntax-highlight"
          dangerouslySetInnerHTML={{
            __html: hljs.highlight(
              JSON.stringify({
                byteSize: memoryType.byteSize,
                alignment: memoryType.alignment,
                arrayStride: memoryType.arrayStride,
              }),
              { language: "json" },
            ).value,
          }}
        />
      </section>
      <h2>WGSL (approximate)</h2>
      <section class="centered">
        <pre
          class="syntax-highlight"
          dangerouslySetInnerHTML={{
            __html: hljs.highlight(
              String(memoryType),
              { language: "wgsl" },
            ).value,
          }}
        />
      </section>
      <h2>JavaScript</h2>
      <section class="centered">
        <pre
          class="syntax-highlight"
          dangerouslySetInnerHTML={{
            __html: hljs.highlight(
              [
                `import * as memory from "jsr:@garciat/wgpu-memory@1.0.14";`,
                ``,
                `const myType = ${memoryType.toCode("memory")};`,
              ].join("\n"),
              { language: "javascript" },
            ).value,
          }}
        />
      </section>
      <h2>Object Value</h2>
      <section class="centered object-value-container">
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
    </>
  );
};

render(<App />, document.querySelector("#PreactMain")!);
