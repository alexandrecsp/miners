const STRINGS = {
  'app.title': 'Miners',
  'app.tagline': 'Mine. Refine. Sell. Expand.',
  'machine.drill': 'Drill',
  'machine.laserMiner': 'Laser Miner',
  'machine.refinery': 'Refinery',
  'placeholder.credits': 'Credits',
  'placeholder.clock': 'Sim clock (s)',
  'placeholder.hint': 'The Zone is being surveyed.',
} as const

export type StringId = keyof typeof STRINGS

export function t(id: StringId): string {
  return STRINGS[id]
}
