import { INGREDIENTS } from './ingredients'
import { GAME_MODEL } from './model'
import { recipeSignature, scoreRecipe } from './scoring'
import type { OptimizationRequest, OptimizationResponse, RecipeCandidate, RecipePart, Trend, TrendOptimizationResult } from './types'

export const OPTIMIZER_VERSION = '1.0.0'

function compareCandidates(a: RecipeCandidate, b: RecipeCandidate): number {
  if (a.score.match !== b.score.match) return b.score.match - a.score.match
  if (a.parts.length !== b.parts.length) return a.parts.length - b.parts.length
  return a.signature.localeCompare(b.signature)
}

function makeCandidate(parts: RecipePart[], trend: Trend): RecipeCandidate {
  const sorted = [...parts].sort((a, b) => a.ingredientId.localeCompare(b.ingredientId))
  return { parts: sorted, score: scoreRecipe(sorted, trend), signature: recipeSignature(sorted) }
}

function shareDistance(a: RecipeCandidate, b: RecipeCandidate): number {
  const shares = new Map(a.parts.map(part => [part.ingredientId, part.share]))
  return b.parts.reduce((sum, part) => sum + Math.abs((shares.get(part.ingredientId) ?? 0) - part.share), 0)
    + a.parts.filter(part => !b.parts.some(other => other.ingredientId === part.ingredientId)).reduce((sum, part) => sum + part.share, 0)
}

function selectDiverse(candidates: RecipeCandidate[], count: number): RecipeCandidate[] {
  const selected: RecipeCandidate[] = []
  for (const candidate of candidates.sort(compareCandidates)) {
    if (selected.every(existing => shareDistance(existing, candidate) >= 16)) selected.push(candidate)
    if (selected.length === count) return selected
  }
  for (const candidate of candidates.sort(compareCandidates)) {
    if (!selected.some(existing => existing.signature === candidate.signature)) selected.push(candidate)
    if (selected.length === count) break
  }
  return selected
}

export function optimizeTrend(trend: Trend, recipesPerTrend = 4, pairOnly = false): TrendOptimizationResult {
  let candidatesEvaluated = 0
  const bestByPair: RecipeCandidate[] = []
  const pool = new Map<string, RecipeCandidate>()

  for (let left = 0; left < INGREDIENTS.length - 1; left++) {
    for (let right = left + 1; right < INGREDIENTS.length; right++) {
      let pairBest: RecipeCandidate | undefined
      for (let share = 1; share < 100; share++) {
        const candidate = makeCandidate([
          { ingredientId: INGREDIENTS[left]!.id, share },
          { ingredientId: INGREDIENTS[right]!.id, share: 100 - share },
        ], trend)
        candidatesEvaluated++
        if (!pairBest || compareCandidates(candidate, pairBest) < 0) pairBest = candidate
      }
      if (pairBest) {
        bestByPair.push(pairBest)
        pool.set(pairBest.signature, pairBest)
      }
    }
  }

  bestByPair.sort(compareCandidates)
  if (!pairOnly) {
    const seeds = bestByPair.slice(0, 96)
    for (const seed of seeds) {
      let current = seed
      for (const amount of [10, 5, 2, 1]) {
        for (let iteration = 0; iteration < 24; iteration++) {
          let best = current
          for (const donor of current.parts) {
            if (donor.share <= amount) continue
            for (const ingredient of INGREDIENTS) {
              if (ingredient.id === donor.ingredientId) continue
              const targetExists = current.parts.some(part => part.ingredientId === ingredient.id)
              if (!targetExists && current.parts.length >= 8) continue
              const parts = current.parts.map(part => ({ ...part }))
              const donorPart = parts.find(part => part.ingredientId === donor.ingredientId)!
              donorPart.share -= amount
              const targetPart = parts.find(part => part.ingredientId === ingredient.id)
              if (targetPart) targetPart.share += amount
              else parts.push({ ingredientId: ingredient.id, share: amount })
              const candidate = makeCandidate(parts, trend)
              candidatesEvaluated++
              pool.set(candidate.signature, candidate)
              if (compareCandidates(candidate, best) < 0) best = candidate
            }
          }
          if (best.signature === current.signature) break
          current = best
        }
      }
      pool.set(current.signature, current)
    }
  }

  return {
    trendIndex: trend.index,
    candidates: selectDiverse([...pool.values()], recipesPerTrend),
    candidatesEvaluated,
  }
}

export function optimizeRecipes(request: OptimizationRequest): OptimizationResponse {
  const results = request.trends.map(trend => optimizeTrend(trend, request.recipesPerTrend ?? 4, request.pairOnly ?? false))
  return {
    requestId: request.requestId,
    modelVersion: GAME_MODEL.label,
    optimizerVersion: OPTIMIZER_VERSION,
    strategy: request.pairOnly ? 'exhaustive-pairs-only' : 'exhaustive-pairs+deterministic-refinement',
    optimality: 'best-found',
    candidatesEvaluated: results.reduce((sum, result) => sum + result.candidatesEvaluated, 0),
    results,
  }
}
