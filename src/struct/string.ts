import type { NonEmpty } from "../internal/constraints.ts";
import { typedObjectKeys } from "../internal/utils.ts";
import type { MemoryType, StructDescriptor, StructType } from "../types.ts";

export function structToString<S extends NonEmpty<StructDescriptor<S>>>(
  struct: StructType<S>,
): string {
  const fields = typedObjectKeys(struct.fields).map((key) => {
    const field = struct.fields[key];
    return `${String(field.name)}: ${String(field.type)}`;
  });
  return `struct { ${fields.join(", ")} }`;
}

export function structToCode<S extends NonEmpty<StructDescriptor<S>>>(
  struct: StructType<S>,
  namespace: string,
  indentation: number = 0,
): string {
  const fields = typedObjectKeys(struct.fields).map((key) => {
    const field = struct.fields[key];
    const fieldType = field.type as MemoryType<unknown, unknown, unknown>;
    return `${String(field.name)}: { index: ${field.index}, type: ${
      fieldType.toCode(namespace, indentation + 2)
    } }`;
  });
  return [
    `${namespace}.StructOf({`,
    ...fields.map((field) => `${" ".repeat(indentation + 2)}${field},`),
    `${" ".repeat(indentation)}})`,
  ].join("\n");
}
