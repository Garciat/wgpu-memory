import type { Uint16Encoded } from "./utils/integer.ts";

export class FormatUint16 {
  static read(view: DataView, offset: number = 0): Uint16Encoded {
    return view.getUint16(offset, true) as Uint16Encoded;
  }

  static write(view: DataView, value: Uint16Encoded, offset: number = 0) {
    view.setUint16(offset, value, true);
  }
}
