import { AXES, createTasteProfile } from './axes'
import { INGREDIENT_BY_ID } from './ingredients'
import type { RecipePart, RecipeScore, Station, TasteProfile, Trend } from './types'

export const STATIONS: readonly Station[] = ['pot', 'pan', 'grill', 'fryer', 'oven', 'prep']

export function validateRecipeComposition(parts: readonly RecipePart[]): string[] {
  const errors: string[] = []
  if (parts.length < 2 || parts.length > 8) errors.push('A recipe must contain between 2 and 8 ingredients.')
  if (new Set(parts.map(part => part.ingredientId)).size !== parts.length) errors.push('Each ingredient can appear only once.')
  if (parts.some(part => !INGREDIENT_BY_ID.has(part.ingredientId))) errors.push('Every ingredient must exist in the known ingredient table.')
  if (parts.some(part => !Number.isInteger(part.share) || part.share < 1 || part.share > 100)) errors.push('Every share must be an integer from 1 to 100.')
  if (parts.reduce((sum, part) => sum + part.share, 0) !== 100) errors.push('Ingredient shares must total exactly 100%.')
  return errors
}

export function validateGameRecipe(parts: readonly RecipePart[], station: string): string[] {
  const errors = validateRecipeComposition(parts)
  if (!STATIONS.includes(station as Station)) errors.push('Station must be pot, pan, grill, fryer, oven, or prep.')
  return errors
}

export function recipeProfile(parts: readonly RecipePart[]): TasteProfile {
  const errors = validateRecipeComposition(parts)
  if (errors.length) throw new Error(errors.join(' '))
  const total = parts.reduce((sum, part) => sum + part.share, 0)
  return createTasteProfile(AXES.map((axis) => {
    const weighted = parts.reduce((sum, part) => sum + INGREDIENT_BY_ID.get(part.ingredientId)!.profile[axis] * part.share, 0)
    return Math.round((weighted / total) * 100) / 100
  }))
}

export function scoreProfile(profile: TasteProfile, target: TasteProfile): RecipeScore {
  const errors = AXES.map(axis => ({
    axis,
    recipe: profile[axis],
    target: target[axis],
    error: Math.abs(profile[axis] - target[axis]),
  }))
  const distance = errors.reduce((sum, item) => sum + item.error, 0)
  const match = Math.min(1, Math.max(0, 1 - distance / 28))
  const popularityMultiplier = 1 + 0.25 * Math.pow(Math.min(1, Math.max(0, match)), 1.6)
  const popularityBonus = popularityMultiplier - 1
  return {
    profile,
    errors,
    distance,
    match,
    uiMatchPercent: Math.round(match * 100),
    popularityMultiplier,
    popularityBonus,
    uiPopularityBonusPercent: Math.round(popularityBonus * 100),
  }
}

export function scoreRecipe(parts: readonly RecipePart[], trend: Trend): RecipeScore {
  return scoreProfile(recipeProfile(parts), trend.target)
}

export function scoreRecipeAcrossTrends(parts: readonly RecipePart[], trends: readonly Trend[]) {
  const scores = trends.map(trend => ({ trend, score: scoreRecipe(parts, trend) }))
  return {
    scores,
    best: scores.reduce((best, current) => current.score.match > best.score.match ? current : best),
  }
}

export function recipeSignature(parts: readonly RecipePart[]): string {
  return [...parts].sort((a, b) => a.ingredientId.localeCompare(b.ingredientId)).map(part => `${part.ingredientId}:${part.share}`).join('|')
}

