if (!("Float16Array" in globalThis)) {
  const { Float16Array, getFloat16, setFloat16 } = await import(
    "npm:@petamoriken/float16"
  );
  Object.defineProperty(globalThis, "Float16Array", {
    configurable: true,
    value: Float16Array,
  });
  Object.defineProperties(DataView.prototype, {
    setFloat16: {
      value(byteOffset: number, value: number, littleEndian?: boolean) {
        return setFloat16(this, byteOffset, value, littleEndian);
      },
    },
    getFloat16: {
      value(byteOffset: number, littleEndian?: boolean) {
        return getFloat16(this, byteOffset, littleEndian);
      },
    },
  });
}

declare global {
  export type Float16Array = import("npm:@petamoriken/float16").Float16Array;

  export interface DataView {
    setFloat16(byteOffset: number, value: number, littleEndian?: boolean): void;
    getFloat16(byteOffset: number, littleEndian?: boolean): number;
  }
}

export {};
