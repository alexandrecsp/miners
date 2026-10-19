/** A source of numbers in [0, 1). */
export interface Rng {
  next(): number
}

/** Anything that stores a generator state, such as the Game State. */
export interface GeneratorHolder {
  generator: number
}

/** The production Rng (mulberry32): each draw advances the holder's stored state. */
export function stateRng(holder: GeneratorHolder): Rng {
  return {
    next() {
      holder.generator = (holder.generator + 0x6d2b79f5) >>> 0
      let t = holder.generator
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
  }
}
