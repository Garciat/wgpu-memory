import { UNORM8 } from "./utils/norm.ts";

export class FormatUnorm8 {
  static read(view: DataView, offset: number = 0): number {
    return UNORM8.fromInteger(view.getUint8(offset));
  }

  static write(view: DataView, value: number, offset: number = 0) {
    view.setUint8(offset, UNORM8.toUint8(value));
  }
}
