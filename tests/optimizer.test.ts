import { describe, expect, it } from 'vitest'
import { optimizeRecipes, optimizeTrend } from '../app/utils/domain/optimizer'
import { GAME_MODEL } from '../app/utils/domain/model'
import { validateRecipeComposition } from '../app/utils/domain/scoring'
import { generateTrends } from '../app/utils/domain/trends'

describe('recipe optimizer', () => {
  it('exhaustively finds and reports the verified pair', () => {
    const trend = generateTrends('12/2286/1348')[0]!
    const first = optimizeTrend(trend, 4, true)
    const second = optimizeTrend(trend, 4, true)
    expect(second).toEqual(first)
    expect(first.candidates).toHaveLength(4)
    expect(first.candidates[0]!.signature).toBe('KETCHUP:50|VINEGAR:50')
    expect(first.candidates[0]!.score.match).toBeCloseTo(0.6785714286, 10)
    expect(first.candidates.every(candidate => validateRecipeComposition(candidate.parts).length === 0)).toBe(true)
    expect(first.candidatesEvaluated).toBe(98010)
  })

  it('keeps refined recommendations deterministic and valid', () => {
    const trend = generateTrends('12/2286/1348')[1]!
    const result = optimizeTrend(trend, 4, false)
    expect(result.candidates).toHaveLength(4)
    expect(result.candidates.every(candidate => validateRecipeComposition(candidate.parts).length === 0)).toBe(true)
    expect(result.candidates.map(candidate => candidate.score.match)).toEqual(
      [...result.candidates].map(candidate => candidate.score.match).sort((a, b) => b - a),
    )
    expect(new Set(result.candidates.map(candidate => candidate.signature)).size).toBe(4)
  }, 20_000)

  it('reports the global model identity in optimizer results', () => {
    const trend = generateTrends('12/2286/1348')[0]!
    const response = optimizeRecipes({ requestId: 'model-test', trends: [trend], pairOnly: true })
    expect(response.modelVersion).toBe(GAME_MODEL.label)
    expect(GAME_MODEL).toMatchObject({ date: '2026-09-23', gameVersion: 'v413' })
  })
})
