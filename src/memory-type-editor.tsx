import { Component, ComponentChildren, JSX } from "npm:preact@10.25.3";
import * as memory from "jsr:@garciat/wgpu-memory@1.0.13";
import {
  AnyArrayType,
  AnyMemoryType,
  AnyScalarMemoryType,
  AnyStructDescriptorType,
  AnyStructType,
  AnyVectorType,
  MemoryTypeKey,
  MemoryTypeKeys,
  parseMemoryTypeKey,
  ScalarMemoryTypeKeys,
} from "./memory-editor-utils.tsx";

export interface MemoryTypeChangeEvent {
  type: AnyMemoryType;
}

interface TypeEditorProps {
  type: AnyMemoryType;
  onChange?: (event: MemoryTypeChangeEvent) => void;
}

const PredefinedTypes: Record<MemoryTypeKey, AnyMemoryType> = {
  "i32": memory.Int32,
  "u32": memory.Uint32,
  "f32": memory.Float32,
  "f16": memory.Float16,
  "bool": memory.Bool,

  "vec2": new memory.Vec2(memory.Float32),
  "vec3": new memory.Vec3(memory.Float32),
  "vec4": new memory.Vec4(memory.Float32),

  "mat2x2": new memory.Mat2x2(memory.Float32),
  "mat3x3": new memory.Mat3x3(memory.Float32),
  "mat4x4": new memory.Mat4x4(memory.Float32),

  "array": new memory.ArrayType(memory.Int32, 4),

  "struct": new memory.Struct({
    u: { index: 0, type: memory.Float32 },
    v: { index: 1, type: memory.Float32 },
    w: { index: 2, type: memory.Vec2F },
    x: { index: 3, type: memory.Float32 },
  }),
};

interface MemoryTypeEditorProps extends TypeEditorProps {
  allowedTypes?: ReadonlySet<MemoryTypeKey>;
}

export const MemoryTypeEditor = (
  { type, allowedTypes = MemoryTypeKeys, onChange }: MemoryTypeEditorProps,
) => {
  function onMemoryTypeChange(event: JSX.TargetedEvent<HTMLSelectElement>) {
    const type = PredefinedTypes[parseMemoryTypeKey(event.currentTarget.value)];
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
  type: AnyVectorType;
}

interface VectorTypeEditorState {
  componentType: AnyScalarMemoryType;
}

interface ArrayTypeEditorProps extends TypeEditorProps {
  type: AnyArrayType;
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
            allowedTypes={ScalarMemoryTypeKeys}
            onChange={this.onComponentTypeChange}
          />
        </p>
      </div>
    );
  }

  private triggerOnChange() {
    switch (this.props.type.shape[0]) {
      case 2:
        this.props.onChange?.({
          type: new memory.Vec2(this.state.componentType),
        });
        break;
      case 3:
        this.props.onChange?.({
          type: new memory.Vec3(this.state.componentType),
        });
        break;
      case 4:
        this.props.onChange?.({
          type: new memory.Vec4(this.state.componentType),
        });
        break;
      default:
        throw new Error(`Unknown vector shape: ${this.props.type.shape}`);
    }
  }

  private onComponentTypeChange = (event: MemoryTypeChangeEvent) => {
    this.setState({
      componentType: event.type as AnyScalarMemoryType,
    }, this.triggerOnChange);
  };
}

interface ArrayTypeEditorState {
  arraySize: number;
  elementType: AnyMemoryType;
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
  type: AnyStructType;
}

interface StructTypeEditorState {
  fields: Array<
    { name: string; type: AnyMemoryType }
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
    const fields = {} as AnyStructDescriptorType;

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
      const vectorType = type as AnyVectorType;
      return <VectorTypeEditor type={vectorType} onChange={onChange} />;
    }

    case "array": {
      const arrayType = type as AnyArrayType;
      return <ArrayTypeEditor type={arrayType} onChange={onChange} />;
    }

    case "struct": {
      const structType = type as AnyStructType;
      return <StructTypeEditor type={structType} onChange={onChange} />;
    }

    default:
      throw new Error(`Unknown memory type: ${type.type}`);
  }
}
