// INFO: https://learn.microsoft.com/en-us/windows/win32/direct3d10/d3d10-graphics-programming-guide-resources-data-conversion#integer-conversion

import {
  Sint16,
  type Sint16Encoded,
  Sint8,
  type Sint8Encoded,
  Uint10,
  type Uint10Encoded,
  Uint16,
  type Uint16Encoded,
  Uint2,
  type Uint2Encoded,
  Uint8,
  type Uint8Encoded,
} from "./integer.ts";

export class UNORM2 {
  static toUint2(value: number): Uint2Encoded {
    if (isNaN(value)) {
      return Uint2.ZERO_BITS;
    }
    if (!isFinite(value)) {
      value = value > 0 ? 1 : 0;
    }
    const integerScaled = value * 0b11;
    return Uint2.fromInteger((integerScaled + 0.5) | 0);
  }

  static fromUint2(value: Uint2Encoded): number {
    return this.fromInteger(Uint2.toInteger(value));
  }

  static fromInteger(value: number): number {
    return value * (1 / 0b11);
  }
}

export class UNORM8 {
  static toUint8(value: number): Uint8Encoded {
    if (isNaN(value)) {
      return Uint8.ZERO_BITS;
    }
    if (!isFinite(value)) {
      value = value > 0 ? 1 : 0;
    }
    const integerScaled = value * 0b1111_1111;
    return Uint8.fromInteger((integerScaled + 0.5) | 0);
  }

  static fromUint8(value: Uint8Encoded): number {
    return this.fromInteger(Uint8.toInteger(value));
  }

  static fromInteger(value: number): number {
    return value * (1 / 0b1111_1111);
  }
}

export class UNORM10 {
  static toUint10(value: number): Uint10Encoded {
    if (isNaN(value)) {
      return Uint10.ZERO_BITS;
    }
    if (!isFinite(value)) {
      value = value > 0 ? 1 : 0;
    }
    const integerScaled = value * 0b11_1111_1111;
    return Uint10.fromInteger((integerScaled + 0.5) | 0);
  }

  static fromUint10(value: Uint10Encoded): number {
    return this.fromInteger(Uint10.toInteger(value));
  }

  static fromInteger(value: number): number {
    return value * (1 / 0b11_1111_1111);
  }
}

export class UNORM16 {
  static toUint16(value: number): Uint16Encoded {
    if (isNaN(value)) {
      return Uint16.ZERO_BITS;
    }
    if (!isFinite(value)) {
      value = value > 0 ? 1 : 0;
    }
    const integerScaled = value * 0b1111_1111_1111_1111;
    return Uint16.fromInteger((integerScaled + 0.5) | 0);
  }

  static fromUint16(value: Uint16Encoded): number {
    return this.fromInteger(Uint16.toInteger(value));
  }

  static fromInteger(value: number): number {
    return value * (1 / 0b1111_1111_1111_1111);
  }
}

export class SNORM8 {
  static toSint8(value: number): Sint8Encoded {
    if (isNaN(value)) {
      return Sint8.ZERO_BITS;
    }
    if (!isFinite(value)) {
      value = value > 0 ? 1 : -1;
    }
    const integerScaled = value * 0b0111_1111;
    if (value >= 0) {
      return Sint8.fromInteger((integerScaled + 0.5) | 0);
    } else {
      return Sint8.fromInteger((integerScaled - 0.5) | 0);
    }
  }

  static fromSint8(value: Sint8Encoded): number {
    if (value === Sint8.MIN_VALUE_BITS) {
      return -1;
    }
    return this.fromInteger(Sint8.toInteger(value));
  }

  static fromInteger(value: number): number {
    return value * (1 / 0b0111_1111);
  }
}

export class SNORM16 {
  static toSint16(value: number): Sint16Encoded {
    if (isNaN(value)) {
      return Sint16.ZERO_BITS;
    }
    if (!isFinite(value)) {
      value = value > 0 ? 1 : -1;
    }
    const integerScaled = value * 0b0111_1111_1111_1111;
    if (value >= 0) {
      return Sint16.fromInteger((integerScaled + 0.5) | 0);
    } else {
      return Sint16.fromInteger((integerScaled - 0.5) | 0);
    }
  }

  static fromSint16(value: Sint16Encoded): number {
    if (value === Sint16.MIN_VALUE) {
      return -1;
    }
    return this.fromInteger(Sint16.toInteger(value));
  }

  static fromInteger(value: number): number {
    return value * (1 / 0b0111_1111_1111_1111);
  }
}
