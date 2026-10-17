const STRINGS = {
  'app.title': 'Miners',
  'app.tagline': 'Mine. Refine. Sell. Expand.',
  'placeholder.credits': 'Credits',
  'placeholder.ore': 'Ore',
  'placeholder.price': 'Ore price',
  'placeholder.hint': 'The Zone is being surveyed.',
} as const

export type StringId = keyof typeof STRINGS

export function t(id: StringId): string {
  return STRINGS[id]
}
