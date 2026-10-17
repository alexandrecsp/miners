const STRINGS = {
  'app.title': 'Miners',
  'app.tagline': 'Mine. Refine. Sell. Expand.',
  'machine.drill': 'Drill',
  'machine.laserMiner': 'Laser Miner',
  'machine.refinery': 'Refinery',
  'resource.ore': 'Ore',
  'resource.crystal': 'Crystal',
  'resource.alloy': 'Alloy',
  'hud.credits': 'Credits',
  'hud.of': 'of',
  'hud.price': 'Price',
} as const

export type StringId = keyof typeof STRINGS

export function t(id: StringId): string {
  return STRINGS[id]
}
