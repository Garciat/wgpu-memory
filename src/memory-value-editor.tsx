import { JSX } from "npm:preact@10.25.3";
import * as memory from "jsr:@garciat/wgpu-memory@1.0.13";

interface ValueEditorProps {
  type: memory.MemoryType<unknown, unknown, unknown>;
  buffer: ArrayBuffer;
  offset: number;
  onChange: () => void;
}

export const MemoryValueEditor = (
  { type, buffer, offset, onChange }: ValueEditorProps,
) => {
  return getMemoryValueEditor({ type, buffer, offset, onChange });
};

interface ScalarValueEditorProps extends ValueEditorProps {
  min?: number;
  max?: number;
}

const ScalarValueEditor = (
  { type, min, max, buffer, offset, onChange }: ScalarValueEditorProps,
) => {
  function onInput(e: JSX.TargetedInputEvent<HTMLInputElement>) {
    if (!e.currentTarget.checkValidity()) {
      return;
    }
    console.log(
      "onInput",
      e.currentTarget.value,
      offset,
      new DataView(buffer, offset),
    );
    type.write(
      new DataView(buffer, offset),
      parseFloat(e.currentTarget.value),
    );
    onChange?.();
  }

  return (
    <>
      <input
        type="number"
        defaultValue={String(type.read(new DataView(buffer, offset)))}
        min={min}
        max={max}
        onInput={onInput}
      />
      <code>{`: ${type.type}`}</code>
    </>
  );
};

interface VectorValueEditorProps extends ValueEditorProps {
  type: memory.VectorType<
    memory.MemoryType<number, unknown, unknown> & {
      type: "f16" | "f32" | "i32" | "u32";
    },
    2 | 3 | 4,
    unknown,
    unknown,
    unknown
  >;
}

const VectorValueEditor = (
  { type, buffer, offset, onChange }: VectorValueEditorProps,
) => {
  return (
    <table class="vector-value-editor table-value-editor">
      <thead>
        <tr>
          <th colspan={2}>
            <pre>{type.type}</pre>
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: type.shape[0] }).map((_, i) => {
          return (
            <tr>
              <td class="column-index">
                <pre>{`${"xyzw"[i]}`}</pre>
              </td>
              <td>
                {getMemoryValueEditor({
                  type: type.componentType,
                  buffer,
                  offset: offset + i * type.componentType.byteSize,
                  onChange,
                })}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

interface ArrayValueEditorProps<N extends number> extends ValueEditorProps {
  type: memory.ArrayType<
    memory.MemoryType<unknown, unknown, unknown>,
    N
  >;
}

const ArrayValueEditor = <N extends number>(
  {
    type,
    buffer,
    offset,
    onChange,
  }: ArrayValueEditorProps<N>,
) => {
  function onElementChange() {
    onChange?.();
  }

  return (
    <table class="array-value-editor table-value-editor">
      <thead>
        <tr>
          <th colspan={2}>
            <pre>{type.type}</pre>
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: type.elementCount }).map((_, i) => (
          <tr key={i}>
            <td class="column-index">
              <pre>{i}</pre>
            </td>
            <td>
              {getMemoryValueEditor({
                type: type.elementType,
                buffer,
                offset: offset + i * type.elementType.arrayStride,
                onChange: onElementChange,
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

interface StructValueEditorProps extends ValueEditorProps {
  type: memory.Struct<
    Record<
      string,
      { index: number; type: memory.MemoryType<unknown, unknown, unknown> }
    >
  >;
}

const StructValueEditor = ({
  type,
  buffer,
  offset,
  onChange,
}: StructValueEditorProps) => {
  return (
    <table class="struct-value-editor table-value-editor">
      <thead>
        <tr>
          <th colspan={2}>
            <pre>{type.type}</pre>
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(type.fields).map(([name]) => {
          const field = type.fields[name];
          return (
            <tr key={name}>
              <td class="column-index">
                <pre>{name}</pre>
              </td>
              <td>
                {getMemoryValueEditor({
                  type: field.type,
                  buffer,
                  offset: offset + field.offset,
                  onChange: onChange,
                })}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

function getMemoryValueEditor(
  { type, buffer, offset, onChange }: ValueEditorProps,
) {
  switch (type.type) {
    case "i32":
      return (
        <ScalarValueEditor
          type={type}
          min={-2147483648}
          max={2147483647}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );
    case "u32":
      return (
        <ScalarValueEditor
          type={type}
          min={0}
          max={4294967295}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );
    case "f32":
      return (
        <ScalarValueEditor
          type={type}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );
    case "f16":
      return (
        <ScalarValueEditor
          type={type}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );
    case "bool":
      return (
        <ScalarValueEditor
          type={type}
          min={0}
          max={1}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );

    case "vec2":
    case "vec3":
    case "vec4": {
      const vectorType = type as memory.VectorType<
        memory.MemoryType<number, unknown, unknown> & {
          type: "f16" | "f32" | "i32" | "u32";
        },
        2 | 3 | 4,
        unknown,
        unknown,
        unknown
      >;
      return (
        <VectorValueEditor
          type={vectorType}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );
    }

    case "array": {
      const arrayType = type as memory.ArrayType<
        memory.MemoryType<unknown, unknown, unknown>,
        number
      >;
      return (
        <ArrayValueEditor
          type={arrayType}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );
    }

    case "struct": {
      const structType = type as memory.Struct<
        Record<
          string,
          { index: number; type: memory.MemoryType<unknown, unknown, unknown> }
        >
      >;
      return (
        <StructValueEditor
          type={structType}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );
    }

    default:
      throw new Error(`Unknown memory type: ${type.type}`);
  }
}
