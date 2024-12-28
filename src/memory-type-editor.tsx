import { Component, ComponentChildren, JSX } from "npm:preact@10.25.3";
import { useState } from "npm:preact@10.25.3/hooks";
import * as memory from "jsr:@garciat/wgpu-memory@1.0.13";

export interface MemoryTypeChangeEvent {
  type: memory.MemoryType<unknown, unknown, unknown>;
  valueEditor: ValueEditorComponent;
}

export interface ValueEditorProps {
  view: DataView;
  onChange?: () => void;
}

export type ValueEditorComponent = (props: ValueEditorProps) => JSX.Element;

interface BaseMemoryTypeEditorProps {
  onChange?: (event: MemoryTypeChangeEvent) => void;
}

export const MemoryTypeEditor = ({ onChange }: BaseMemoryTypeEditorProps) => {
  const [memoryTypeKey, setMemoryTypeKey] = useState<
    keyof typeof MemoryTypeEditors
  >("i32");

  function onMemoryTypeChange(e: JSX.TargetedInputEvent<HTMLSelectElement>) {
    setMemoryTypeKey(parseMemoryTypeEditorKey(e.currentTarget.value));
  }

  function onNestedEditorChange(e: MemoryTypeChangeEvent) {
    onChange?.(e);
  }

  const DynamicEditor = MemoryTypeEditors[memoryTypeKey];

  return (
    <div class="memory-type-editor">
      <select
        name="memory-type"
        onInput={onMemoryTypeChange}
      >
        {Object.keys(MemoryTypeEditors).map((key) => <option>{key}</option>)}
      </select>
      <DynamicEditor onChange={onNestedEditorChange} />
    </div>
  );
};

interface PredefinedTypeEditorProps extends BaseMemoryTypeEditorProps {
  type: memory.MemoryType<unknown, unknown, unknown>;
  valueEditor: ValueEditorComponent;
}

class PredefinedTypeEditor extends Component<PredefinedTypeEditorProps> {
  override componentDidMount(): void {
    this.props.onChange?.({
      type: this.props.type,
      valueEditor: this.props.valueEditor,
    });
  }

  override render(): ComponentChildren {
    return <></>;
  }
}

function makePredefinedTypeEditor(
  type: memory.MemoryType<unknown, unknown, unknown>,
  valueEditor: ValueEditorComponent,
) {
  return ({ onChange }: BaseMemoryTypeEditorProps) => {
    return (
      <PredefinedTypeEditor
        type={type}
        valueEditor={valueEditor}
        onChange={onChange}
      />
    );
  };
}

interface ArrayTypeEditorState {
  arraySize: number;
  elementType: memory.MemoryType<unknown, unknown, unknown>;
  elementValueEditor: ValueEditorComponent;
}

class ArrayTypeEditor
  extends Component<BaseMemoryTypeEditorProps, ArrayTypeEditorState> {
  constructor() {
    super();
    this.state = {
      elementType: memory.Int32,
      arraySize: 1,
      elementValueEditor: NullValueEditor,
    };
  }

  override componentDidMount(): void {
    this.triggerOnChange();
  }

  override render(): ComponentChildren {
    return (
      <div class="array-type-editor">
        <p>
          <span>{"Element Count: "}</span>
          <input
            type="number"
            required={true}
            min={1}
            defaultValue={1}
            onInput={this.onArraySizeChange}
          />
        </p>
        <div>
          <span>{"Element Type: "}</span>
          <MemoryTypeEditor onChange={this.onElementTypeChange} />
        </div>
      </div>
    );
  }

  private triggerOnChange() {
    const type = new memory.ArrayType(
      this.state.elementType,
      this.state.arraySize,
    );
    this.props.onChange?.({
      type,
      valueEditor: makeArrayValueEditor(type, this.state.elementValueEditor),
    });
  }

  private onElementTypeChange = (event: MemoryTypeChangeEvent) => {
    this.setState({
      elementType: event.type,
      elementValueEditor: event.valueEditor,
    }, this.triggerOnChange);
  };

  private onArraySizeChange = (e: JSX.TargetedInputEvent<HTMLInputElement>) => {
    if (!e.currentTarget.checkValidity()) {
      return;
    }
    this.setState(
      { arraySize: parseInt(e.currentTarget.value) },
      this.triggerOnChange,
    );
  };
}

interface StructTypeEditorState {
  fields: Array<
    { name: string; type: memory.MemoryType<unknown, unknown, unknown> }
  >;
}

class StructTypeEditor
  extends Component<BaseMemoryTypeEditorProps, StructTypeEditorState> {
  constructor() {
    super();
    this.state = {
      fields: [
        { name: "field0", type: memory.Int32 },
      ],
    };
  }

  override componentDidMount(): void {
    this.triggerOnChange();
  }

  override render(): ComponentChildren {
    return (
      <table class="struct-type-editor">
        <thead>
          <tr>
            <th>{"Field Name"}</th>
            <th>{"Field Type"}</th>
          </tr>
        </thead>
        <tbody>
          {this.state.fields.map((field, i) => (
            <tr>
              <td>
                <input
                  type="text"
                  defaultValue={field.name}
                  onInput={(e) => this.onFieldNameChange(i, e)}
                />
              </td>
              <td>
                <MemoryTypeEditor
                  onChange={(e) => this.onFieldTypeChange(i, e)}
                />
              </td>
            </tr>
          ))}
          <tr>
            <td colspan={2}>
              <button onClick={this.addField}>{"Add Field"}</button>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  private triggerOnChange() {
    const fields = {} as Record<
      string,
      { index: number; type: memory.MemoryType<unknown, unknown, unknown> }
    >;

    for (const [i, field] of this.state.fields.entries()) {
      fields[field.name] = { index: i, type: field.type };
    }

    const type = new memory.Struct(fields);

    this.props.onChange?.({
      type,
      valueEditor: makeStructValueEditor(type),
    });
  }

  private addField = () => {
    this.setState(
      (state) => ({
        fields: [
          ...state.fields,
          { name: `field${state.fields.length}`, type: memory.Int32 },
        ],
      }),
      this.triggerOnChange,
    );
  };

  private onFieldNameChange(
    i: number,
    e: JSX.TargetedInputEvent<HTMLInputElement>,
  ) {
    this.setState((state) => {
      const fields = [...state.fields];
      fields[i] = { ...fields[i], name: e.currentTarget.value };
      return { fields };
    }, this.triggerOnChange);
  }

  private onFieldTypeChange(i: number, e: MemoryTypeChangeEvent) {
    this.setState((state) => {
      const fields = [...state.fields];
      fields[i] = { ...fields[i], type: e.type };
      return { fields };
    }, this.triggerOnChange);
  }
}

interface NumericValueEditorConfig {
  min?: number;
  max?: number;
}

function makeNumericValueEditor(
  type: memory.MemoryType<unknown, unknown, unknown>,
  { min, max }: NumericValueEditorConfig = {},
) {
  return ({ view, onChange }: ValueEditorProps) => {
    function onInput(e: JSX.TargetedInputEvent<HTMLInputElement>) {
      type.write(view, parseFloat(e.currentTarget.value));
      onChange?.();
    }

    return (
      <>
        <input
          type="number"
          defaultValue={0}
          min={min}
          max={max}
          onInput={onInput}
        />
      </>
    );
  };
}

const Int32ValueEditor = makeNumericValueEditor(memory.Int32);
const Uint32ValueEditor = makeNumericValueEditor(memory.Uint32, { min: 0 });
const Float32ValueEditor = makeNumericValueEditor(memory.Float32);
const Float16ValueEditor = makeNumericValueEditor(memory.Float16);

function makeVectorValueEditor<
  V extends memory.VectorType<
    memory.MemoryType<number, unknown, unknown> & {
      type: "f16" | "f32" | "i32" | "u32";
    },
    N,
    unknown,
    unknown,
    unknown
  >,
  N extends 2 | 3 | 4,
>(
  vectorType: V,
  componentEditor: ValueEditorComponent,
) {
  return ({ view, onChange }: ValueEditorProps) => {
    const ElementValueEditor = componentEditor;

    function onElementChange() {
      onChange?.();
    }

    return (
      <table class="vector-value-editor table-value-editor">
        <thead>
          <tr>
            <th colspan={2}>
              <pre>{vectorType.type}</pre>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: vectorType.shape[0] }).map((_, i) => (
            <tr>
              <td class="column-index">
                <pre>{`${"xyzw"[i]}`}</pre>
              </td>
              <td>
                <ElementValueEditor
                  view={new DataView(
                    view.buffer,
                    view.byteOffset + i * vectorType.componentType.byteSize,
                  )}
                  onChange={onElementChange}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
}

const Vec2IValueEditor = makeVectorValueEditor(
  memory.Vec2I,
  Int32ValueEditor,
);
const Vec3IValueEditor = makeVectorValueEditor(
  memory.Vec3I,
  Int32ValueEditor,
);
const Vec4IValueEditor = makeVectorValueEditor(
  memory.Vec4I,
  Int32ValueEditor,
);

const Vec2UValueEditor = makeVectorValueEditor(
  memory.Vec2U,
  Uint32ValueEditor,
);
const Vec3UValueEditor = makeVectorValueEditor(
  memory.Vec3U,
  Uint32ValueEditor,
);
const Vec4UValueEditor = makeVectorValueEditor(
  memory.Vec4U,
  Uint32ValueEditor,
);

const Vec2FValueEditor = makeVectorValueEditor(
  memory.Vec2F,
  Float32ValueEditor,
);
const Vec3FValueEditor = makeVectorValueEditor(
  memory.Vec3F,
  Float32ValueEditor,
);
const Vec4FValueEditor = makeVectorValueEditor(
  memory.Vec4F,
  Float32ValueEditor,
);

const Vec2HValueEditor = makeVectorValueEditor(
  memory.Vec2H,
  Float16ValueEditor,
);
const Vec3HValueEditor = makeVectorValueEditor(
  memory.Vec3H,
  Float16ValueEditor,
);
const Vec4HValueEditor = makeVectorValueEditor(
  memory.Vec4H,
  Float16ValueEditor,
);

interface ArrayValueEditorProps<N extends number> extends ValueEditorProps {
  arrayType: memory.ArrayType<
    memory.MemoryType<unknown, unknown, unknown>,
    N
  >;
  elementValueEditor: ValueEditorComponent;
}

const ArrayValueEditor = <N extends number>(
  {
    arrayType,
    elementValueEditor,
    view,
    onChange,
  }: ArrayValueEditorProps<N>,
) => {
  const ElementValueEditor = elementValueEditor;

  function onElementChange() {
    onChange?.();
  }

  return (
    <table class="array-value-editor table-value-editor">
      <thead>
        <tr>
          <th colspan={2}>
            <pre>{arrayType.type}</pre>
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: arrayType.elementCount }).map((_, i) => (
          <tr key={i}>
            <td class="column-index">
              <pre>{i}</pre>
            </td>
            <td>
              <ElementValueEditor
                view={new DataView(
                  view.buffer,
                  view.byteOffset + i * arrayType.elementType.arrayStride,
                )}
                onChange={onElementChange}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

function makeArrayValueEditor<N extends number>(
  arrayType: memory.ArrayType<
    memory.MemoryType<unknown, unknown, unknown>,
    N
  >,
  elementValueEditor: ValueEditorComponent,
) {
  return ({ view, onChange }: ValueEditorProps) => {
    return (
      <ArrayValueEditor
        arrayType={arrayType}
        elementValueEditor={elementValueEditor}
        view={view}
        onChange={onChange}
      />
    );
  };
}

interface StructValueEditorProps extends ValueEditorProps {
  structType: memory.Struct<
    Record<
      string,
      { index: number; type: memory.MemoryType<unknown, unknown, unknown> }
    >
  >;
}

const StructValueEditor = ({
  structType,
  view,
  onChange,
}: StructValueEditorProps) => {
  const editors = {} as Record<string, ValueEditorComponent>;

  for (const [name, field] of Object.entries(structType.fields)) {
    editors[name] = getValueEditor(field.type);
  }

  function onFieldValueChange() {
    onChange?.();
  }

  return (
    <table class="struct-value-editor table-value-editor">
      <thead>
        <tr>
          <th colspan={2}>
            <pre>{structType.type}</pre>
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(structType.fields).map(([name]) => {
          const field = structType.fields[name];
          const ValueEditor = editors[name];
          return (
            <tr key={name}>
              <td class="column-index">
                <pre>{name}</pre>
              </td>
              <td>
                <ValueEditor
                  view={new DataView(
                    view.buffer,
                    view.byteOffset + field.offset,
                  )}
                  onChange={onFieldValueChange}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

function makeStructValueEditor(
  structType: memory.Struct<
    Record<
      string,
      { index: number; type: memory.MemoryType<unknown, unknown, unknown> }
    >
  >,
) {
  return ({ view, onChange }: ValueEditorProps) => {
    return (
      <StructValueEditor
        structType={structType}
        view={view}
        onChange={onChange}
      />
    );
  };
}

export const NullValueEditor = (_props: ValueEditorProps) => {
  return <></>;
};

function getValueEditor(
  type: memory.MemoryType<unknown, unknown, unknown>,
): ValueEditorComponent {
  switch (type.type) {
    case "i32":
      return Int32ValueEditor;
    case "u32":
      return Uint32ValueEditor;
    case "f32":
      return Float32ValueEditor;
    case "f16":
      return Float16ValueEditor;

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
      return makeVectorValueEditor(
        vectorType,
        getValueEditor(vectorType.componentType),
      );
    }

    case "array": {
      const arrayType = type as memory.ArrayType<
        memory.MemoryType<unknown, unknown, unknown>,
        number
      >;
      return makeArrayValueEditor(
        arrayType,
        getValueEditor(arrayType.elementType),
      );
    }

    case "struct": {
      const structType = type as memory.Struct<
        Record<
          string,
          { index: number; type: memory.MemoryType<unknown, unknown, unknown> }
        >
      >;
      return makeStructValueEditor(structType);
    }

    default:
      return NullValueEditor;
  }
}

const MemoryTypeEditors = {
  "i32": makePredefinedTypeEditor(memory.Int32, Int32ValueEditor),
  "vec2i": makePredefinedTypeEditor(memory.Vec2I, Vec2IValueEditor),
  "vec3i": makePredefinedTypeEditor(memory.Vec3I, Vec3IValueEditor),
  "vec4i": makePredefinedTypeEditor(memory.Vec4I, Vec4IValueEditor),

  "u32": makePredefinedTypeEditor(memory.Uint32, Uint32ValueEditor),
  "vec2u": makePredefinedTypeEditor(memory.Vec2U, Vec2UValueEditor),
  "vec3u": makePredefinedTypeEditor(memory.Vec3U, Vec3UValueEditor),
  "vec4u": makePredefinedTypeEditor(memory.Vec4U, Vec4UValueEditor),

  "f32": makePredefinedTypeEditor(memory.Float32, Float32ValueEditor),
  "vec2f": makePredefinedTypeEditor(memory.Vec2F, Vec2FValueEditor),
  "vec3f": makePredefinedTypeEditor(memory.Vec3F, Vec3FValueEditor),
  "vec4f": makePredefinedTypeEditor(memory.Vec4F, Vec4FValueEditor),

  "f16": makePredefinedTypeEditor(memory.Float16, Float16ValueEditor),
  "vec2h": makePredefinedTypeEditor(memory.Vec2H, Vec2HValueEditor),
  "vec3h": makePredefinedTypeEditor(memory.Vec3H, Vec3HValueEditor),
  "vec4h": makePredefinedTypeEditor(memory.Vec4H, Vec4HValueEditor),

  "array": ArrayTypeEditor,

  "struct": StructTypeEditor,
};

function parseMemoryTypeEditorKey(key: string): keyof typeof MemoryTypeEditors {
  if (key in MemoryTypeEditors) {
    return key as keyof typeof MemoryTypeEditors;
  } else {
    throw new Error(`Unknown memory type editor key: ${key}`);
  }
}
