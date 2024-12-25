export function nextPowerOfTwo(value: number): number {
  return 2 ** Math.ceil(Math.log2(value));
}

/**
 * @see https://gpuweb.github.io/gpuweb/wgsl/#roundup
 */
export function wgslRoundUp(k: number, n: number): number {
  return Math.ceil(n / k) * k;
}
