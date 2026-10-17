import { describe, expect, it } from 'vitest'
import { t } from './strings'

describe('string table', () => {
  it('returns English text for a stable string id', () => {
    expect(t('app.title')).toBe('Miners')
  })
})
