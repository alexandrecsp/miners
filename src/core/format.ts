const SUFFIXES = ['', 'K', 'M', 'B', 'T']
const PRICE_DECIMAL_LIMIT = 100

export interface FormatOptions {
  /** Price mode: two decimals for magnitudes below 100. */
  price?: boolean
  /** Stat mode: two decimals for magnitudes below 1,000, so a Base Stat of 1.05 stays readable. */
  stat?: boolean
}

function truncateToTier(magnitude: number, tier: number): number {
  return Math.floor((magnitude / 1000 ** tier) * 10) / 10
}

export function formatNumber(value: number, options: FormatOptions = {}): string {
  const sign = value < 0 ? '-' : ''
  const magnitude = Math.abs(value)

  if (options.price && magnitude < PRICE_DECIMAL_LIMIT) {
    const fixed = magnitude.toFixed(2)
    // Rounding can reach the limit (99.999); show it as a whole number then.
    return sign + (Number(fixed) >= PRICE_DECIMAL_LIMIT ? String(PRICE_DECIMAL_LIMIT) : fixed)
  }
  if (options.stat && magnitude < 1000) return sign + magnitude.toFixed(2)
  if (magnitude < 1000) return sign + String(Math.floor(magnitude))

  let tier = Math.min(Math.floor(Math.log10(magnitude) / 3), SUFFIXES.length)
  let scaled = truncateToTier(magnitude, tier)
  if (scaled >= 1000) {
    tier += 1
    scaled = truncateToTier(magnitude, tier)
  }
  if (tier >= SUFFIXES.length) {
    const [mantissa = '', exponent = ''] = magnitude.toExponential(1).split('e')
    return `${sign}${mantissa}e${exponent.replace('+', '')}`
  }
  return `${sign}${scaled.toFixed(1)}${SUFFIXES[tier]}`
}
