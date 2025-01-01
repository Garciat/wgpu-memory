import { UNORM16 } from "./utils/norm.ts";

export class FormatUnorm16 {
  static read(view: DataView, offset: number = 0): number {
    return UNORM16.fromInteger(view.getUint16(offset));
  }

  static write(view: DataView, value: number, offset: number = 0) {
    view.setUint16(offset, UNORM16.toUint16(value));
  }
}
