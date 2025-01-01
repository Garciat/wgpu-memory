import { FormatUint8 } from "./uint8.ts";
import { Sint8, Uint8 } from "./utils/integer.ts";
import { SNORM8 } from "./utils/norm.ts";

export class FormatSnorm8 {
  static read(view: DataView, offset: number = 0): number {
    return SNORM8.fromSint8(Sint8.bitCastUint8(FormatUint8.read(view, offset)));
  }

  static write(view: DataView, value: number, offset: number = 0) {
    FormatUint8.write(view, Uint8.bitCastSint8(SNORM8.toSint8(value)), offset);
  }
}
