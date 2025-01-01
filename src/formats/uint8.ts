import type { Uint8Encoded } from "./utils/integer.ts";

export class FormatUint8 {
  static read(view: DataView, offset: number = 0): Uint8Encoded {
    return view.getUint8(offset) as Uint8Encoded;
  }

  static write(view: DataView, value: Uint8Encoded, offset: number = 0) {
    view.setUint8(offset, value);
  }
}
