import { Sint8, type Sint8Encoded } from "./utils/integer.ts";

export class FormatSint8 {
  static read(view: DataView, offset: number = 0): Sint8Encoded {
    return view.getInt8(offset) as Sint8Encoded;
  }

  static write(view: DataView, value: Sint8Encoded, offset: number = 0) {
    view.setInt8(offset, value);
  }

  static writeClamped(view: DataView, value: number, offset: number = 0) {
    this.write(view, Sint8.fromIntegerClamped(value), offset);
  }
}
