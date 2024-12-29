import type { NonEmpty } from "../internal/constraints.ts";
import { typedObjectKeys } from "../internal/utils.ts";
import type { MemoryType } from "../types.ts";
import type { IStruct, StructDescriptor } from "./types.ts";

export function toCodeImpl<S extends NonEmpty<StructDescriptor<S>>>(
  struct: IStruct<S>,
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
    `new ${namespace}.Struct({`,
    ...fields.map((field) => `${" ".repeat(indentation + 2)}${field},`),
    `${" ".repeat(indentation)}})`,
  ].join("\n");
}

export function toWgslImpl<S extends NonEmpty<StructDescriptor<S>>>(
  struct: IStruct<S>,
): string {
  const fields = typedObjectKeys(struct.fields).map((key) => {
    const field = struct.fields[key];
    return `${String(field.name)}: ${String(field.type)}`;
  });
  return `struct { ${fields.join(", ")} }`;
}
