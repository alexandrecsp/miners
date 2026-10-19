import { describe, expect, it } from 'vitest'
import { t, tf } from './strings'

describe('string table', () => {
  it('returns English text for a stable string id', () => {
    expect(t('app.title')).toBe('Miners')
  })

  it('fills a template string with its named values', () => {
    expect(tf('hud.sellOrderTerms', { minPrice: '0.90', reserve: '100' })).toBe('Min price 0.90 · Reserve 100')
  })
})
