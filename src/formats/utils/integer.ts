export type Uint2Encoded = number & { __uint2__: never };
export type Uint8Encoded = number & { __uint8__: never };
export type Uint10Encoded = number & { __uint10__: never };
export type Uint16Encoded = number & { __uint16__: never };

export type Sint8Encoded = number & { __sint8__: never };
export type Sint16Encoded = number & { __sint16__: never };

export class Uint2 {
  static readonly ZERO_BITS = 0b00 as Uint2Encoded;
  static readonly MAX_VALUE_BITS = 0b11 as Uint2Encoded;

  static readonly MAX_VALUE = 0b11 as const;

  static toInteger(bits: Uint2Encoded): number {
    return bits & 0b11;
  }

  static fromIntegerClamped(value: number): Uint2Encoded {
    value = value | 0;
    if (value > 0b11) {
      return 0b11 as Uint2Encoded;
    }
    if (value < 0) {
      return 0 as Uint2Encoded;
    }
    return this.fromInteger(value);
  }

  static fromInteger(value: number): Uint2Encoded {
    value = value | 0;
    return (value & 0b11) as Uint2Encoded;
  }
}

export class Uint8 {
  static readonly ZERO_BITS = 0b0000_0000 as Uint8Encoded;
  static readonly MAX_VALUE_BITS = 0b1111_1111 as Uint8Encoded;

  static readonly MAX_VALUE = 0b1111_1111 as const;

  static toInteger(bits: Uint8Encoded): number {
    return bits & 0b1111_1111;
  }

  static fromIntegerClamped(value: number): Uint8Encoded {
    value = value | 0;
    if (value > 0b1111_1111) {
      return 0b1111_1111 as Uint8Encoded;
    }
    if (value < 0) {
      return 0 as Uint8Encoded;
    }
    return this.fromInteger(value);
  }

  static fromInteger(value: number): Uint8Encoded {
    value = value | 0;
    return (value & 0b1111_1111) as Uint8Encoded;
  }

  static bitCastSint8(value: Sint8Encoded): Uint8Encoded {
    return value as number as Uint8Encoded;
  }
}

export class Uint10 {
  static readonly ZERO_BITS = 0b0000_0000_00 as Uint10Encoded;
  static readonly MAX_VALUE_BITS = 0b11_1111_1111 as Uint10Encoded;

  static readonly MAX_VALUE = 0b11_1111_1111 as const;

  static toInteger(bits: Uint10Encoded): number {
    return bits & 0b11_1111_1111;
  }

  static fromIntegerClamped(value: number): Uint10Encoded {
    value = value | 0;
    if (value > 0b11_1111_1111) {
      return 0b11_1111_1111 as Uint10Encoded;
    }
    if (value < 0) {
      return 0 as Uint10Encoded;
    }
    return this.fromInteger(value);
  }

  static fromInteger(value: number): Uint10Encoded {
    value = value | 0;
    return (value & 0b11_1111_1111) as Uint10Encoded;
  }
}

export class Uint16 {
  static readonly ZERO_BITS = 0b0000_0000_0000_0000 as Uint16Encoded;
  static readonly MAX_VALUE_BITS = 0b1111_1111_1111_1111 as Uint16Encoded;

  static readonly MAX_VALUE = 0b1111_1111_1111_1111 as const;

  static toInteger(bits: Uint16Encoded): number {
    return bits & 0b1111_1111_1111_1111;
  }

  static fromIntegerClamped(value: number): Uint16Encoded {
    value = value | 0;
    if (value > 0b1111_1111_1111_1111) {
      return 0b1111_1111_1111_1111 as Uint16Encoded;
    }
    if (value < 0) {
      return 0 as Uint16Encoded;
    }
    return this.fromInteger(value);
  }

  static fromInteger(value: number): Uint16Encoded {
    value = value | 0;
    return (value & 0b1111_1111_1111_1111) as Uint16Encoded;
  }
  static bitCastSint16(value: Sint16Encoded): Uint16Encoded {
    return value as number as Uint16Encoded;
  }
}

export class Sint8 {
  static readonly ZERO_BITS = 0b0000_0000 as Sint8Encoded;
  static readonly MAX_VALUE_BITS = 0b0111_1111 as Sint8Encoded;
  static readonly MIN_VALUE_BITS = 0b1000_0000 as Sint8Encoded;

  static readonly MAX_VALUE = 0b0111_1111 as const;
  static readonly MIN_VALUE = -0b1000_0000 as const;

  static toInteger(bits: Sint8Encoded): number {
    const value = bits & 0b1111_1111;
    if (value & 0b1000_0000) {
      return value - 0b1_0000_0000;
    }
    return value;
  }

  static fromIntegerClamped(value: number): Sint8Encoded {
    value = value | 0;
    if (value > 0b0111_1111) {
      return 0b0111_1111 as Sint8Encoded;
    }
    if (value < -0b1000_0000) {
      return 0b1000_0000 as Sint8Encoded;
    }
    return this.fromInteger(value);
  }

  static fromInteger(value: number): Sint8Encoded {
    value = value | 0;
    if (value < 0) {
      return ((0b1_0000_0000 + value) & 0b1111_1111) as Sint8Encoded;
    }
    return (value & 0b0111_1111) as Sint8Encoded;
  }

  static bitCastUint8(value: Uint8Encoded): Sint8Encoded {
    return value as number as Sint8Encoded;
  }
}

export class Sint16 {
  static readonly ZERO_BITS = 0b0000_0000_0000_0000 as Sint16Encoded;
  static readonly MAX_VALUE_BITS = 0b0111_1111_1111_1111 as Sint16Encoded;
  static readonly MIN_VALUE_BITS = 0b1000_0000_0000_0000 as Sint16Encoded;

  static readonly MAX_VALUE = 0b0111_1111_1111_1111 as const;
  static readonly MIN_VALUE = -0b1000_0000_0000_0000 as const;

  static toInteger(bits: Sint16Encoded): number {
    const value = bits & 0b1111_1111_1111_1111;
    if (value & 0b1000_0000_0000_0000) {
      return value - 0b1_0000_0000_0000_0000;
    }
    return value;
  }

  static fromIntegerClamped(value: number): Sint16Encoded {
    value = value | 0;
    if (value > 0b0111_1111_1111_1111) {
      return 0b0111_1111_1111_1111 as Sint16Encoded;
    }
    if (value < -0b1000_0000_0000_0000) {
      return 0b1000_0000_0000_0000 as Sint16Encoded;
    }
    return this.fromInteger(value);
  }

  static fromInteger(value: number): Sint16Encoded {
    value = value | 0;
    if (value < 0) {
      return ((0b1_0000_0000_0000_0000 + value) &
        0b1111_1111_1111_1111) as Sint16Encoded;
    }
    return (value & 0b0111_1111_1111_1111) as Sint16Encoded;
  }
  static bitCastUint16(value: Uint16Encoded): Sint16Encoded {
    return value as number as Sint16Encoded;
  }
}
