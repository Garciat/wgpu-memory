/**
 * @see https://gpuweb.github.io/gpuweb/wgsl/#roundup
 */
export function wgslRoundUp(k: number, n: number): number {
  return Math.ceil(n / k) * k;
}
