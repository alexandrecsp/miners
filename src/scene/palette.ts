const TOKENS = {
  fog: '--color-scene-fog',
  lightSky: '--color-scene-light-sky',
  lightWarm: '--color-scene-light-warm',
  lightCyan: '--color-scene-light-cyan',
  key: '--color-scene-key',
  highlight: '--color-scene-highlight',
  tile: '--color-scene-tile',
  unlockedTint: '--color-scene-unlocked-tint',
  lockedDim: '--color-scene-locked-dim',
  rock: '--color-scene-rock',
  ore: '--color-scene-ore',
  oreGlow: '--color-scene-ore-glow',
  crystal: '--color-scene-crystal',
  crystalGlow: '--color-scene-crystal-glow',
  drill: '--color-scene-drill',
  drillGlow: '--color-scene-drill-glow',
  laserMiner: '--color-scene-laser-miner',
  laserMinerGlow: '--color-scene-laser-miner-glow',
  refinery: '--color-scene-refinery',
  refineryGlow: '--color-scene-refinery-glow',
} as const

export type PaletteKey = keyof typeof TOKENS

const cache = new Map<PaletteKey, string>()

/** A Scene colour, read once from the Tailwind `@theme` token so no component holds a literal. */
export function scenePalette(key: PaletteKey): string {
  let value = cache.get(key)
  if (value === undefined) {
    value = getComputedStyle(document.documentElement).getPropertyValue(TOKENS[key]).trim()
    cache.set(key, value)
  }
  return value
}
