export type TasteAxis =
  | 'sweet'
  | 'salty'
  | 'sour'
  | 'bitter'
  | 'umami'
  | 'spice'
  | 'richness'
  | 'freshness'

export type TasteProfile = Readonly<Record<TasteAxis, number>>

export type Station = 'pot' | 'pan' | 'grill' | 'fryer' | 'oven' | 'prep'

export interface Ingredient {
  id: string
  name: string
  profile: TasteProfile
}

export interface RecipePart {
  ingredientId: string
  share: number
}

export interface Trend {
  index: number
  name: string
  primary: TasteAxis
  secondary: TasteAxis
  boosted: TasteAxis
  target: TasteProfile
}

export interface AxisError {
  axis: TasteAxis
  recipe: number
  target: number
  error: number
}

export interface RecipeScore {
  profile: TasteProfile
  errors: AxisError[]
  distance: number
  match: number
  uiMatchPercent: number
  popularityMultiplier: number
  popularityBonus: number
  uiPopularityBonusPercent: number
}

export interface RecipeCandidate {
  parts: RecipePart[]
  score: RecipeScore
  signature: string
}

export interface TrendOptimizationResult {
  trendIndex: number
  candidates: RecipeCandidate[]
  candidatesEvaluated: number
}

export interface OptimizationResponse {
  requestId: string
  modelVersion: string
  optimizerVersion: string
  strategy: 'exhaustive-pairs+deterministic-refinement' | 'exhaustive-pairs-only'
  optimality: 'best-found'
  candidatesEvaluated: number
  results: TrendOptimizationResult[]
}

export interface OptimizationRequest {
  requestId: string
  trends: Trend[]
  recipesPerTrend?: number
  pairOnly?: boolean
}

