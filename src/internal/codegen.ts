import { invariant } from "./assert.ts";

export class CodeGen {
  static evaluate(
    args: Array<{ name: string; value: unknown }>,
    expression: string,
  ): unknown {
    const argNames = args.map((arg) => arg.name);
    const argValues = args.map((arg) => arg.value);

    invariant(
      argNames.length === new Set(argNames).size,
      `Duplicate arg names: ${argNames}`,
    );

    return Function(...argNames, `return ${expression};`)(...argValues);
  }

  static statements<T>(
    input: ReadonlyArray<T>,
    f: (value: T) => string,
  ): string {
    return input.map((item) => f(item)).join("\n");
  }

  static objectLiteral<T>(
    input: ReadonlyArray<T>,
    keyF: (value: T) => string,
    valueF: (value: T) => string,
  ): string {
    return [
      "{",
      ...input.map((item) => `${keyF(item)}: ${valueF(item)},`),
      `}`,
    ].join("\n");
  }
}
