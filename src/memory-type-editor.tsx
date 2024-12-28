import { Component, ComponentChildren, JSX } from "npm:preact@10.25.3";
import * as memory from "jsr:@garciat/wgpu-memory@1.0.14";
import {
  AnyArrayType,
  AnyFloatingPointMemoryType,
  AnyMatrixType,
  AnyMemoryType,
  AnyScalarMemoryType,
  AnyStructDescriptorType,
  AnyStructType,
  AnyVectorType,
  FloatingPointMemoryTypeKeys,
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
    field0: { index: 0, type: memory.Float32 },
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
    <table class="memory-type-editor memory-editor-table">
      <thead>
        <tr>
          <th colSpan={2}>
            <select
              name="memory-type"
              onInput={onMemoryTypeChange}
            >
              {Array.from(allowedTypes).map((key) => (
                <option selected={key === type.type}>{key}</option>
              ))}
            </select>
          </th>
        </tr>
      </thead>
      {getMemoryTypeEditor({ type, onChange })}
    </table>
  );
};

class ScalarTypeEditor extends Component<TypeEditorProps> {
  override componentDidMount(): void {
    this.props.onChange?.({
      type: this.props.type,
    });
  }

  override render(): ComponentChildren {
    return <tbody></tbody>;
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
      <tbody>
        <tr>
          <td>
            <pre>Component Type</pre>
          </td>
          <td>
            <MemoryTypeEditor
              type={this.state.componentType}
              allowedTypes={ScalarMemoryTypeKeys}
              onChange={this.onComponentTypeChange}
            />
          </td>
        </tr>
      </tbody>
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

interface MatrixTypeEditorProps extends TypeEditorProps {
  type: AnyMatrixType;
}

interface MatrixTypeEditorState {
  componentType: AnyFloatingPointMemoryType;
}

class MatrixTypeEditor
  extends Component<MatrixTypeEditorProps, MatrixTypeEditorState> {
  constructor({ type }: MatrixTypeEditorProps) {
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
      <tbody>
        <tr>
          <td>
            <pre>Component Type</pre>
          </td>
          <td>
            <MemoryTypeEditor
              type={this.state.componentType}
              allowedTypes={FloatingPointMemoryTypeKeys}
              onChange={this.onComponentTypeChange}
            />
          </td>
        </tr>
      </tbody>
    );
  }

  private triggerOnChange() {
    switch (this.props.type.type) {
      case "mat2x2":
        this.props.onChange?.({
          type: new memory.Mat2x2(this.state.componentType),
        });
        break;
      case "mat3x3":
        this.props.onChange?.({
          type: new memory.Mat3x3(this.state.componentType),
        });
        break;
      case "mat4x4":
        this.props.onChange?.({
          type: new memory.Mat4x4(this.state.componentType),
        });
        break;
      default:
        throw new Error(`Unknown matrix type: ${this.props.type.type}`);
    }
  }

  private onComponentTypeChange = (event: MemoryTypeChangeEvent) => {
    this.setState({
      componentType: event.type as AnyFloatingPointMemoryType,
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
      <tbody>
        <tr>
          <td>
            <pre>{"Element Count"}</pre>
          </td>
          <td>
            <input
              type="number"
              required={true}
              min={1}
              defaultValue={1}
              onInput={this.onArraySizeChange}
            />
          </td>
        </tr>
        <tr>
          <td>
            <pre>{"Element Type"}</pre>
          </td>
          <td>
            <MemoryTypeEditor
              type={this.state.elementType}
              onChange={this.onElementTypeChange}
            />
          </td>
        </tr>
      </tbody>
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
  #counter: number;

  constructor({ type }: StructTypeEditorProps) {
    super();
    this.state = {
      fields: Object.entries(type.fields).map(([name, field]) => ({
        name,
        type: field.type,
      })),
    };
    this.#counter = 0;
  }

  override componentDidMount(): void {
    this.triggerOnChange();
  }

  override render(): ComponentChildren {
    return (
      <tbody>
        {this.state.fields.map((field, i) => (
          <tr>
            <td>
              <button onClick={() => this.removeField(i)}>{"✖️"}</button>
              &nbsp;
              <input
                class="field-name"
                type="text"
                required={true}
                defaultValue={field.name}
                pattern={"^[a-zA-Z_][a-zA-Z0-9_]*$"}
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
            <button onClick={() => this.addField()}>{"Add Field"}</button>
          </td>
        </tr>
      </tbody>
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

  private addField(): void {
    while (
      this.state.fields.some((field) => field.name === `field${this.#counter}`)
    ) {
      this.#counter++;
    }
    this.setState(
      (state) => ({
        fields: [
          ...state.fields,
          {
            name: `field${this.#counter}`,
            type: memory.Float32,
          },
        ],
      }),
      this.triggerOnChange,
    );
  }

  private removeField(i: number) {
    if (this.state.fields.length === 1) {
      return;
    }
    this.setState(
      (state) => ({
        fields: state.fields.filter((_, j) => j !== i),
      }),
      this.triggerOnChange,
    );
  }

  private onFieldNameChange(
    i: number,
    e: JSX.TargetedInputEvent<HTMLInputElement>,
  ) {
    if (
      this.state.fields.some((field, j) =>
        i !== j && field.name === e.currentTarget.value
      )
    ) {
      e.currentTarget.setCustomValidity("Field names must be unique.");
    }
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }
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
    case "vec4":
      return (
        <VectorTypeEditor type={type as AnyVectorType} onChange={onChange} />
      );

    case "mat2x2":
    case "mat3x3":
    case "mat4x4":
      return (
        <MatrixTypeEditor type={type as AnyMatrixType} onChange={onChange} />
      );

    case "array":
      return (
        <ArrayTypeEditor
          type={type as AnyArrayType}
          onChange={onChange}
        />
      );

    case "struct":
      return (
        <StructTypeEditor type={type as AnyStructType} onChange={onChange} />
      );

    default:
      throw new Error(`Unknown memory type: ${type.type}`);
  }
}
