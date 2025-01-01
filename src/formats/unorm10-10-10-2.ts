import {
  Uint10,
  type Uint10Encoded,
  Uint2,
  type Uint2Encoded,
} from "./utils/integer.ts";
import { UNORM10, UNORM2 } from "./utils/norm.ts";

const MASK_10 = 0b11_1111_1111;
const MASK_2 = 0b11;

const OFFSET_R = 22;
const OFFSET_G = 12;
const OFFSET_B = 2;
const OFFSET_A = 0;

const MASK_R = MASK_10 << OFFSET_R;
const MASK_G = MASK_10 << OFFSET_G;
const MASK_B = MASK_10 << OFFSET_B;
const MASK_A = MASK_2 << OFFSET_A;

export class FormatUnorm10_10_10_2 {
  static read(
    view: DataView,
    offset: number = 0,
  ): [number, number, number, number] {
    const [r, g, b, a] = this.readInt(view, offset);
    return [
      UNORM10.fromUint10(r),
      UNORM10.fromUint10(g),
      UNORM10.fromUint10(b),
      UNORM2.fromUint2(a),
    ];
  }

  static write(
    view: DataView,
    value: [number, number, number, number],
    offset: number = 0,
  ): void {
    this.writeInt(view, [
      UNORM10.toUint10(value[0]),
      UNORM10.toUint10(value[1]),
      UNORM10.toUint10(value[2]),
      UNORM2.toUint2(value[3]),
    ], offset);
  }

  static readInt(
    view: DataView,
    offset: number = 0,
  ): [Uint10Encoded, Uint10Encoded, Uint10Encoded, Uint2Encoded] {
    const packed = view.getUint32(offset, true);
    return [
      Uint10.fromInteger(((packed >>> 0) & MASK_R) >>> OFFSET_R),
      Uint10.fromInteger(((packed >>> 0) & MASK_G) >>> OFFSET_G),
      Uint10.fromInteger(((packed >>> 0) & MASK_B) >>> OFFSET_B),
      Uint2.fromInteger(((packed >>> 0) & MASK_A) >>> OFFSET_A),
    ];
  }

  static writeInt(
    view: DataView,
    value: [Uint10Encoded, Uint10Encoded, Uint10Encoded, Uint2Encoded],
    offset: number = 0,
  ): void {
    const [r, g, b, a] = value;
    const packed = ((r & MASK_10) << OFFSET_R) |
      ((g & MASK_10) << OFFSET_G) |
      ((b & MASK_10) << OFFSET_B) |
      ((a & MASK_2) << OFFSET_A);
    view.setUint32(offset, packed, true);
  }
}
