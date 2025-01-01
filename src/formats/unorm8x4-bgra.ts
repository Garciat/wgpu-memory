import { Uint8, type Uint8Encoded } from "./utils/integer.ts";
import { UNORM8 } from "./utils/norm.ts";

const MASK_8 = 0b1111_1111;

const OFFSET_B = 24;
const OFFSET_G = 16;
const OFFSET_R = 8;
const OFFSET_A = 0;

const MASK_B = MASK_8 << OFFSET_B;
const MASK_G = MASK_8 << OFFSET_G;
const MASK_R = MASK_8 << OFFSET_R;
const MASK_A = MASK_8 << OFFSET_A;

export class FormatUnorm8x4_BGRA {
  static read(
    view: DataView,
    offset: number = 0,
  ): [number, number, number, number] {
    const [b, g, r, a] = this.readInt(view, offset);
    return [
      UNORM8.fromUint8(b),
      UNORM8.fromUint8(g),
      UNORM8.fromUint8(r),
      UNORM8.fromUint8(a),
    ];
  }

  static write(
    view: DataView,
    value: [number, number, number, number],
    offset: number = 0,
  ): void {
    this.writeInt(view, [
      UNORM8.toUint8(value[0]),
      UNORM8.toUint8(value[1]),
      UNORM8.toUint8(value[2]),
      UNORM8.toUint8(value[3]),
    ], offset);
  }

  static readInt(
    view: DataView,
    offset: number = 0,
  ): [Uint8Encoded, Uint8Encoded, Uint8Encoded, Uint8Encoded] {
    const packed = view.getUint32(offset, true);
    return [
      Uint8.fromInteger(((packed >>> 0) & MASK_B) >>> OFFSET_B),
      Uint8.fromInteger(((packed >>> 0) & MASK_G) >>> OFFSET_G),
      Uint8.fromInteger(((packed >>> 0) & MASK_R) >>> OFFSET_R),
      Uint8.fromInteger(((packed >>> 0) & MASK_A) >>> OFFSET_A),
    ];
  }

  static writeInt(
    view: DataView,
    value: [Uint8Encoded, Uint8Encoded, Uint8Encoded, Uint8Encoded],
    offset: number = 0,
  ): void {
    const [r, g, b, a] = value;
    const packed = ((b & MASK_8) << OFFSET_B) |
      ((g & MASK_8) << OFFSET_G) |
      ((r & MASK_8) << OFFSET_R) |
      ((a & MASK_8) << OFFSET_A);
    view.setUint32(offset, packed, true);
  }
}
