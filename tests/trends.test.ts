import { describe, expect, it } from 'vitest'
import { profileToArray } from '../app/utils/domain/axes'
import { eligiblePrimaryAxes } from '../app/utils/domain/ingredients'
import { generateTrends, trendSeed } from '../app/utils/domain/trends'

describe('trend generation', () => {
  it('matches the primary verified location exactly', () => {
    expect(trendSeed('12/2286/1348')).toBe('crtrend:1:12/2286/1348')
    const trends = generateTrends('12/2286/1348')
    expect(trends.map(trend => trend.name)).toEqual(['Sour & Sweet', 'Salty & Richness', 'Richness & Spice'])
    expect(profileToArray(trends[0]!.target)).toEqual([5.5, 1, 9, 0.5, 1.5, 5, 0, 1.5])
  })

  it('matches the second required fixture', () => {
    const trends = generateTrends('12/2287/1348')
    expect(trends.map(trend => trend.name)).toEqual(['Spice & Sweet', 'Sweet & Sour', 'Spice & Umami'])
    expect(profileToArray(trends[0]!.target)).toEqual([8, 2, 2, 2, 1.5, 7, 0.5, 3.5])
    expect(profileToArray(trends[1]!.target)).toEqual([8, 3.5, 7, 1.5, 0.5, 2, 2, 2.5])
    expect(profileToArray(trends[2]!.target)).toEqual([1, 1.5, 1, 0, 5.5, 7.5, 3.5, 0.5])
  })

  it('is repeatable and does not reuse unordered primary pairs', () => {
    const first = generateTrends('12/2000/1400')
    expect(generateTrends('12/2000/1400')).toEqual(first)
    const pairs = first.map(trend => [trend.primary, trend.secondary].sort().join('|'))
    expect(new Set(pairs).size).toBe(3)
    expect(eligiblePrimaryAxes()).not.toContain('bitter')
  })
})

