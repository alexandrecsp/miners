import { describe, expect, it } from 'vitest'
import { formatNumber } from './format'

describe('formatNumber', () => {
  it('formats values below 1,000 as whole numbers', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(999)).toBe('999')
    expect(formatNumber(999.9)).toBe('999')
  })
  it('formats thousands with K', () => {
    expect(formatNumber(1234)).toBe('1.2K')
  })
  it('formats millions with M', () => {
    expect(formatNumber(3_400_000)).toBe('3.4M')
  })
  it('formats billions with B and trillions with T', () => {
    expect(formatNumber(5_600_000_000)).toBe('5.6B')
    expect(formatNumber(7_800_000_000_000)).toBe('7.8T')
  })
  it('uses scientific notation past the T range', () => {
    expect(formatNumber(1.5e15)).toBe('1.5e15')
    expect(formatNumber(2e18)).toBe('2.0e18')
  })
  it('truncates consistently at suffix boundaries', () => {
    expect(formatNumber(999_960)).toBe('999.9K')
    expect(formatNumber(999_999)).toBe('999.9K')
    expect(formatNumber(1_000_000)).toBe('1.0M')
    expect(formatNumber(999_960_000)).toBe('999.9M')
  })
  it('keeps the sign of negative numbers', () => {
    expect(formatNumber(-5)).toBe('-5')
    expect(formatNumber(-1234)).toBe('-1.2K')
  })
  it('shows two decimals in price mode below 100', () => {
    expect(formatNumber(0.85, { price: true })).toBe('0.85')
    expect(formatNumber(12.5, { price: true })).toBe('12.50')
  })
  it('shows a price that rounds up to 100 as 100', () => {
    expect(formatNumber(99.999, { price: true })).toBe('100')
  })
  it('uses the compact format in price mode from 100 up', () => {
    expect(formatNumber(1234, { price: true })).toBe('1.2K')
    expect(formatNumber(150, { price: true })).toBe('150')
  })
  it('formats stats with two decimals', () => {
    expect(formatNumber(1.05, { stat: true })).toBe('1.05')
    expect(formatNumber(0.8, { stat: true })).toBe('0.80')
  })
})
