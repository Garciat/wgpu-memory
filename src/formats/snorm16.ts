import { FormatUint16 } from "./uint16.ts";
import { Sint16, Uint16 } from "./utils/integer.ts";
import { SNORM16 } from "./utils/norm.ts";

export class FormatSnorm16 {
  static read(view: DataView, offset: number = 0): number {
    return SNORM16.fromSint16(
      Sint16.bitCastUint16(FormatUint16.read(view, offset)),
    );
  }

  static write(view: DataView, value: number, offset: number = 0) {
    FormatUint16.write(
      view,
      Uint16.bitCastSint16(SNORM16.toSint16(value)),
      offset,
    );
  }
}
