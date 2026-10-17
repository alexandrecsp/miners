/** Effective Stat: the Base Stat times the product of the multipliers, plus the sum of the flat bonuses. */
export function effectiveStat(base: number, multipliers: readonly number[], flats: readonly number[]): number {
  const product = multipliers.reduce((acc, m) => acc * m, 1)
  const bonus = flats.reduce((acc, f) => acc + f, 0)
  return base * product + bonus
}
