import { Component, ComponentChildren, JSX } from "npm:preact@10.25.3";
import * as memory from "jsr:@garciat/wgpu-memory@1.0.13";

export interface MemoryTypeChangeEvent {
  type: memory.MemoryType<unknown, unknown, unknown>;
}

interface TypeEditorProps {
  type: memory.MemoryType<unknown, unknown, unknown>;
  onChange?: (event: MemoryTypeChangeEvent) => void;
}

const PredefinedTypes = {
  "i32": memory.Int32,
  "u32": memory.Uint32,
  "f32": memory.Float32,
  "f16": memory.Float16,
  "bool": memory.Bool,

  "vec2": new memory.Vec2(memory.Float32),
  "vec3": new memory.Vec3(memory.Float32),
  "vec4": new memory.Vec4(memory.Float32),

  "array": new memory.ArrayType(memory.Int32, 4),

  "struct": new memory.Struct({
    u: { index: 0, type: memory.Float32 },
    v: { index: 1, type: memory.Float32 },
    w: { index: 2, type: memory.Vec2F },
    x: { index: 3, type: memory.Float32 },
  }),
};

const AllTypes = new Set(Object.keys(PredefinedTypes));
const ScalarTypes = new Set(["i32", "u32", "f32", "f16", "bool"]);

interface MemoryTypeEditorProps extends TypeEditorProps {
  allowedTypes?: Set<string>;
}

export const MemoryTypeEditor = (
  { type, allowedTypes = AllTypes, onChange }: MemoryTypeEditorProps,
) => {
  function onMemoryTypeChange(event: JSX.TargetedEvent<HTMLSelectElement>) {
    const type = PredefinedTypes[
      event.currentTarget.value as unknown as keyof typeof PredefinedTypes
    ];
    onChange?.({ type });
  }

  return (
    <div class="memory-type-editor">
      <select
        name="memory-type"
        onInput={onMemoryTypeChange}
      >
        {Array.from(allowedTypes).map((key) => (
          <option selected={key === type.type}>{key}</option>
        ))}
      </select>
      {getMemoryTypeEditor({ type, onChange })}
    </div>
  );
};

class ScalarTypeEditor extends Component<TypeEditorProps> {
  override componentDidMount(): void {
    this.props.onChange?.({
      type: this.props.type,
    });
  }

  override render(): ComponentChildren {
    return <></>;
  }
}

interface VectorTypeEditorProps extends TypeEditorProps {
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

interface VectorTypeEditorState {
  componentType: memory.MemoryType<unknown, unknown, unknown> & {
    type: "f16" | "f32" | "i32" | "u32";
  };
}

interface ArrayTypeEditorProps extends TypeEditorProps {
  type: memory.ArrayType<
    memory.MemoryType<unknown, unknown, unknown>,
    number
  >;
}

class VectorTypeEditor
  extends Component<VectorTypeEditorProps, VectorTypeEditorState> {
  constructor({ type }: VectorTypeEditorProps) {
    super();
    this.state = {
      componentType: type.componentType,
    };
  }

  override componentDidMount(): void {
    this.triggerOnChange();
  }

  override render(): ComponentChildren {
    return (
      <div class="vector-type-editor">
        <p>
          <span>{"Component Type: "}</span>
          <MemoryTypeEditor
            type={this.state.componentType}
            allowedTypes={ScalarTypes}
            onChange={this.onComponentTypeChange}
          />
        </p>
      </div>
    );
  }

  // TODO: types
  private triggerOnChange() {
    switch (this.props.type.shape[0]) {
      case 2:
        this.props.onChange?.({
          type: new memory.Vec2(
            this.state.componentType as unknown as typeof memory.Int32,
          ),
        });
        break;
      case 3:
        this.props.onChange?.({
          type: new memory.Vec3(
            this.state.componentType as unknown as typeof memory.Int32,
          ),
        });
        break;
      case 4:
        this.props.onChange?.({
          type: new memory.Vec4(
            this.state.componentType as unknown as typeof memory.Int32,
          ),
        });
        break;
    }
  }

  // TODO: types
  private onComponentTypeChange = (event: MemoryTypeChangeEvent) => {
    this.setState({
      componentType: event.type as unknown as typeof memory.Int32,
    }, this.triggerOnChange);
  };
}

interface ArrayTypeEditorState {
  arraySize: number;
  elementType: memory.MemoryType<unknown, unknown, unknown>;
}

class ArrayTypeEditor
  extends Component<ArrayTypeEditorProps, ArrayTypeEditorState> {
  constructor({ type }: ArrayTypeEditorProps) {
    super();
    this.state = {
      elementType: type.elementType,
      arraySize: type.elementCount,
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
          <MemoryTypeEditor
            type={this.state.elementType}
            onChange={this.onElementTypeChange}
          />
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
    });
  }

  private onElementTypeChange = (event: MemoryTypeChangeEvent) => {
    this.setState({
      elementType: event.type,
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

interface StructTypeEditorProps extends TypeEditorProps {
  type: memory.Struct<
    Record<
      string,
      { index: number; type: memory.MemoryType<unknown, unknown, unknown> }
    >
  >;
}

interface StructTypeEditorState {
  fields: Array<
    { name: string; type: memory.MemoryType<unknown, unknown, unknown> }
  >;
}

class StructTypeEditor
  extends Component<StructTypeEditorProps, StructTypeEditorState> {
  constructor({ type }: StructTypeEditorProps) {
    super();
    this.state = {
      fields: Object.entries(type.fields).map(([name, field]) => ({
        name,
        type: field.type,
      })),
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
                  type={field.type}
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

function getMemoryTypeEditor(
  { type, onChange }: TypeEditorProps,
) {
  switch (type.type) {
    case "i32":
      return <ScalarTypeEditor type={type} onChange={onChange} />;
    case "u32":
      return <ScalarTypeEditor type={type} onChange={onChange} />;
    case "f32":
      return <ScalarTypeEditor type={type} onChange={onChange} />;
    case "f16":
      return <ScalarTypeEditor type={type} onChange={onChange} />;
    case "bool":
      return <ScalarTypeEditor type={type} onChange={onChange} />;

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
      return <VectorTypeEditor type={vectorType} onChange={onChange} />;
    }

    case "array": {
      const arrayType = type as memory.ArrayType<
        memory.MemoryType<unknown, unknown, unknown>,
        number
      >;
      return <ArrayTypeEditor type={arrayType} onChange={onChange} />;
    }

    case "struct": {
      const structType = type as memory.Struct<
        Record<
          string,
          { index: number; type: memory.MemoryType<unknown, unknown, unknown> }
        >
      >;
      return <StructTypeEditor type={structType} onChange={onChange} />;
    }

    default:
      throw new Error(`Unknown memory type: ${type.type}`);
  }
}
