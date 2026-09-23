import { describe, expect, it } from 'vitest'
import { profileToArray } from '../app/utils/domain/axes'
import { generateTrends } from '../app/utils/domain/trends'
import { recipeProfile, scoreRecipe, validateGameRecipe, validateRecipeComposition } from '../app/utils/domain/scoring'

const trends = generateTrends('12/2286/1348')

describe('recipe scoring', () => {
  it('matches the Ketchup/Vinegar UI fixture across all trends', () => {
    const parts = [{ ingredientId: 'KETCHUP', share: 50 }, { ingredientId: 'VINEGAR', share: 50 }]
    expect(profileToArray(recipeProfile(parts))).toEqual([3.5, 2, 7.5, 0.5, 1.5, 0.5, 0, 1.5])

    const scores = trends.map(trend => scoreRecipe(parts, trend))
    expect(scores[0]!.distance).toBe(9)
    expect(scores[0]!.match).toBeCloseTo(0.6785714286, 10)
    expect(scores.map(score => score.uiMatchPercent)).toEqual([68, 27, 16])
    expect(scores.map(score => score.uiPopularityBonusPercent)).toEqual([13, 3, 1])
  })

  it('preserves the corrected historical regression profiles', () => {
    const strawberryMix = [
      { ingredientId: 'STRAWBERRY', share: 20 },
      { ingredientId: 'KETCHUP', share: 30 },
      { ingredientId: 'MUSTARD', share: 50 },
    ]
    expect(profileToArray(recipeProfile(strawberryMix))).toEqual([4, 3.2, 4.6, 0.5, 1.4, 3, 0.5, 2.4])
    expect(scoreRecipe(strawberryMix, trends[0]!).distance).toBeCloseTo(11.6)
    expect(scoreRecipe(strawberryMix, trends[0]!).uiMatchPercent).toBe(59)

    const relishMix = [
      { ingredientId: 'RELISH', share: 50 },
      { ingredientId: 'MUSTARD', share: 30 },
      { ingredientId: 'STRAWBERRY', share: 20 },
    ]
    expect(profileToArray(recipeProfile(relishMix))).toEqual([4.7, 2.7, 5.1, 0.3, 0.8, 2.3, 0.3, 3.4])
    const score = scoreRecipe(relishMix, trends[0]!)
    expect(score.distance).toBeCloseTo(12.2)
    expect(score.uiMatchPercent).toBe(56)
    expect(score.uiPopularityBonusPercent).toBe(10)
  })

  it('rejects invalid compositions and stations', () => {
    expect(validateRecipeComposition([{ ingredientId: 'KETCHUP', share: 100 }])).not.toHaveLength(0)
    expect(validateRecipeComposition([{ ingredientId: 'KETCHUP', share: 50 }, { ingredientId: 'KETCHUP', share: 50 }])).toContain('Each ingredient can appear only once.')
    expect(validateRecipeComposition([{ ingredientId: 'KETCHUP', share: 50 }, { ingredientId: 'NOPE', share: 50 }])).not.toHaveLength(0)
    expect(validateRecipeComposition([{ ingredientId: 'KETCHUP', share: 50.5 }, { ingredientId: 'VINEGAR', share: 49.5 }])).not.toHaveLength(0)
    expect(validateRecipeComposition([{ ingredientId: 'KETCHUP', share: 40 }, { ingredientId: 'VINEGAR', share: 40 }])).not.toHaveLength(0)
    expect(validateGameRecipe([{ ingredientId: 'KETCHUP', share: 50 }, { ingredientId: 'VINEGAR', share: 50 }], 'microwave')).toContain('Station must be pot, pan, grill, fryer, oven, or prep.')
    expect(validateGameRecipe([{ ingredientId: 'KETCHUP', share: 50 }, { ingredientId: 'VINEGAR', share: 50 }], 'prep')).toHaveLength(0)
  })
})

