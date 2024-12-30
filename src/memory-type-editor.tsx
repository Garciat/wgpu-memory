import { Component, ComponentChildren, JSX } from "npm:preact@10.25.3";
import * as memory from "jsr:@garciat/wgpu-memory@1.1.0";
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

  "vec2": memory.Vec2F,
  "vec3": memory.Vec3F,
  "vec4": memory.Vec4F,

  "mat2x2": memory.Mat2x2F,
  "mat3x3": memory.Mat3x3F,
  "mat4x4": memory.Mat4x4F,

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
  override render(): ComponentChildren {
    return <tbody></tbody>;
  }
}

interface VectorTypeEditorProps extends TypeEditorProps {
  type: AnyVectorType;
}

class VectorTypeEditor extends Component<VectorTypeEditorProps> {
  override render(): ComponentChildren {
    return (
      <tbody>
        <tr>
          <td>
            <pre>Component Type</pre>
          </td>
          <td>
            <MemoryTypeEditor
              type={this.props.type.componentType}
              allowedTypes={ScalarMemoryTypeKeys}
              onChange={(ev) => this.onComponentTypeChange(ev)}
            />
          </td>
        </tr>
      </tbody>
    );
  }

  private onComponentTypeChange = (event: MemoryTypeChangeEvent) => {
    const componentType = event.type as AnyScalarMemoryType;

    let vectorType: AnyVectorType;
    switch (this.props.type.shape[0]) {
      case 2:
        vectorType = new memory.Vec2(componentType);
        break;
      case 3:
        vectorType = new memory.Vec3(componentType);
        break;
      case 4:
        vectorType = new memory.Vec4(componentType);
        break;
      default:
        throw new Error(`Unknown vector shape: ${this.props.type.shape}`);
    }

    this.props.onChange?.({
      type: vectorType,
    });
  };
}

interface MatrixTypeEditorProps extends TypeEditorProps {
  type: AnyMatrixType;
}

class MatrixTypeEditor extends Component<MatrixTypeEditorProps> {
  override render(): ComponentChildren {
    return (
      <tbody>
        <tr>
          <td>
            <pre>Component Type</pre>
          </td>
          <td>
            <MemoryTypeEditor
              type={this.props.type.componentType}
              allowedTypes={FloatingPointMemoryTypeKeys}
              onChange={(ev) => this.onComponentTypeChange(ev)}
            />
          </td>
        </tr>
      </tbody>
    );
  }

  private onComponentTypeChange(event: MemoryTypeChangeEvent) {
    const componentType = event.type as AnyFloatingPointMemoryType;

    let matrixType: AnyMatrixType;
    switch (this.props.type.type) {
      case "mat2x2":
        switch (componentType.type) {
          case "f32":
            matrixType = memory.Mat2x2F;
            break;
          case "f16":
            matrixType = memory.Mat2x2H;
            break;
        }
        break;
      case "mat3x3":
        switch (componentType.type) {
          case "f32":
            matrixType = memory.Mat3x3F;
            break;
          case "f16":
            matrixType = memory.Mat3x3H;
            break;
        }
        break;
      case "mat4x4":
        switch (componentType.type) {
          case "f32":
            matrixType = memory.Mat4x4F;
            break;
          case "f16":
            matrixType = memory.Mat4x4H;
            break;
        }
        break;
      default:
        throw new Error(`Unknown matrix type: ${this.props.type.type}`);
    }

    this.props.onChange?.({
      type: matrixType,
    });
  }
}

interface ArrayTypeEditorProps extends TypeEditorProps {
  type: AnyArrayType;
}

class ArrayTypeEditor extends Component<ArrayTypeEditorProps> {
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
              onInput={(ev) => this.onArraySizeChange(ev)}
            />
          </td>
        </tr>
        <tr>
          <td>
            <pre>{"Element Type"}</pre>
          </td>
          <td>
            <MemoryTypeEditor
              type={this.props.type.elementType}
              onChange={(ev) => this.onElementTypeChange(ev)}
            />
          </td>
        </tr>
      </tbody>
    );
  }

  private onElementTypeChange = (event: MemoryTypeChangeEvent) => {
    const elementType = event.type as AnyMemoryType;

    const arrayType = new memory.ArrayType(
      elementType,
      this.props.type.elementCount,
    );

    this.props.onChange?.({
      type: arrayType,
    });
  };

  private onArraySizeChange = (e: JSX.TargetedInputEvent<HTMLInputElement>) => {
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    const elementCount = parseInt(e.currentTarget.value);

    const arrayType = new memory.ArrayType(
      this.props.type.elementType,
      elementCount,
    );

    this.props.onChange?.({
      type: arrayType,
    });
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
    } else {
      e.currentTarget.setCustomValidity("");
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
