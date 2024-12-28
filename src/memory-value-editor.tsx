import { JSX } from "npm:preact@10.25.3";
import * as memory from "jsr:@garciat/wgpu-memory@1.0.14";
import {
  AnyArrayType,
  AnyMatrixType,
  AnyMemoryType,
  AnyNumericMemoryType,
  AnyStructType,
  AnyVectorType,
} from "./memory-editor-utils.tsx";

interface ValueEditorProps {
  type: AnyMemoryType;
  buffer: ArrayBuffer;
  offset: number;
  onChange: () => void;
}

export const MemoryValueEditor = (
  { type, buffer, offset, onChange }: ValueEditorProps,
) => {
  return getMemoryValueEditor({ type, buffer, offset, onChange });
};

interface NumericValueEditorProps extends ValueEditorProps {
  type: AnyNumericMemoryType;
  isInteger: boolean;
  min?: number;
  max?: number;
}

const NumericValueEditor = (
  { type, min, max, isInteger, buffer, offset, onChange }:
    NumericValueEditorProps,
) => {
  function onInput(e: JSX.TargetedInputEvent<HTMLInputElement>) {
    if (!e.currentTarget.checkValidity()) {
      return;
    }
    type.write(
      new DataView(buffer, offset),
      isInteger
        ? parseInt(e.currentTarget.value)
        : parseFloat(e.currentTarget.value),
    );
    onChange?.();
  }

  return (
    <>
      <input
        type="number"
        required={true}
        defaultValue={String(type.read(new DataView(buffer, offset)))}
        min={min}
        max={max}
        step={isInteger ? undefined : "any"}
        onInput={onInput}
      />
      <code>{`: ${type.type}`}</code>
    </>
  );
};

interface BooleanValueEditorProps extends ValueEditorProps {
  type: typeof memory.Bool;
}

const BooleanValueEditor = (
  { type, buffer, offset, onChange }: BooleanValueEditorProps,
) => {
  function onInput(e: JSX.TargetedInputEvent<HTMLInputElement>) {
    if (!e.currentTarget.checkValidity()) {
      return;
    }
    type.write(
      new DataView(buffer, offset),
      e.currentTarget.checked,
    );
    onChange?.();
  }

  return (
    <>
      <input
        type="checkbox"
        checked={type.read(new DataView(buffer, offset))}
        onInput={onInput}
      />
      <code>{`: ${type.type}`}</code>
    </>
  );
};

interface VectorValueEditorProps extends ValueEditorProps {
  type: AnyVectorType;
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
                  offset: offset + type.offset([i as 0 | 1 | 2 | 3]),
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

interface MatrixValueEditorProps extends ValueEditorProps {
  type: AnyMatrixType;
}

const MatrixValueEditor = (
  { type, buffer, offset, onChange }: MatrixValueEditorProps,
) => {
  return (
    <table class="matrix-value-editor table-value-editor">
      <thead>
        <tr>
          <th colspan={2}>
            <pre>{type.type}</pre>
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: type.shape[1] }).map((_, row) => {
          return (
            <tr>
              {Array.from({ length: type.shape[0] }).map((_, col) => {
                return (
                  <td>
                    {getMemoryValueEditor({
                      type: type.componentType,
                      buffer,
                      offset: offset + type.offset([
                        col as 0 | 1 | 2 | 3,
                        row as 0 | 1 | 2 | 3,
                      ]),
                      onChange,
                    })}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

interface ArrayValueEditorProps<N extends number> extends ValueEditorProps {
  type: AnyArrayType;
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
  type: AnyStructType;
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
        <NumericValueEditor
          type={type as typeof memory.Int32}
          isInteger={true}
          min={-2147483648}
          max={2147483647}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );
    case "u32":
      return (
        <NumericValueEditor
          type={type as typeof memory.Uint32}
          isInteger={true}
          min={0}
          max={4294967295}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );
    case "f32":
      return (
        <NumericValueEditor
          type={type as typeof memory.Float32}
          isInteger={false}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );
    case "f16":
      return (
        <NumericValueEditor
          type={type as typeof memory.Float16}
          isInteger={false}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );
    case "bool":
      return (
        <BooleanValueEditor
          type={type as typeof memory.Bool}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );

    case "vec2":
    case "vec3":
    case "vec4":
      return (
        <VectorValueEditor
          type={type as AnyVectorType}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );

    case "mat2x2":
    case "mat3x3":
    case "mat4x4":
      return (
        <MatrixValueEditor
          type={type as AnyMatrixType}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );

    case "array":
      return (
        <ArrayValueEditor
          type={type as AnyArrayType}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );

    case "struct":
      return (
        <StructValueEditor
          type={type as AnyStructType}
          buffer={buffer}
          offset={offset}
          onChange={onChange}
        />
      );

    default:
      throw new Error(`Unknown memory type: ${type.type}`);
  }
}
