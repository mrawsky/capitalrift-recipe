<script setup lang="ts">
import { INGREDIENT_BY_ID } from '../utils/domain/ingredients'
import { scoreRecipeAcrossTrends } from '../utils/domain/scoring'
import { AXIS_LABELS } from '../utils/domain/axes'
import type { RecipeCandidate, Trend } from '../utils/domain/types'

const props = defineProps<{
  candidate: RecipeCandidate
  trend: Trend
  trends: Trend[]
  rank: number
}>()

const copied = ref(false)
const crossScores = computed(() => scoreRecipeAcrossTrends(props.candidate.parts, props.trends))
const suggestedName = computed(() => {
  const top = [...props.candidate.parts].sort((a, b) => b.share - a.share).slice(0, 2)
  return `${top.map(part => INGREDIENT_BY_ID.get(part.ingredientId)?.name).join(' & ')} Blend`
})

async function copyRecipe() {
  const lines = [
    `${suggestedName.value} — suggested name`,
    ...props.candidate.parts.map(part => `${INGREDIENT_BY_ID.get(part.ingredientId)?.name}: ${part.share}%`),
    `${props.candidate.score.uiMatchPercent}% match with ${props.trend.name} (${(props.candidate.score.match * 100).toFixed(4)}% exact)`,
  ]
  await navigator.clipboard.writeText(lines.join('\n'))
  copied.value = true
  setTimeout(() => copied.value = false, 1800)
}
</script>

<template>
  <article class="recipe-card">
    <header class="recipe-card__head">
      <div>
        <p class="eyebrow">CANDIDATE {{ String(rank).padStart(2, '0') }} / SUGGESTED NAME</p>
        <h4>{{ suggestedName }}</h4>
      </div>
      <div class="score-lockup" :aria-label="`${candidate.score.uiMatchPercent} percent match`">
        <strong>{{ candidate.score.uiMatchPercent }}%</strong>
        <span>+{{ candidate.score.uiPopularityBonusPercent }}% popularity</span>
      </div>
    </header>

    <ul class="ingredient-list" aria-label="Ingredient percentages">
      <li v-for="part in candidate.parts" :key="part.ingredientId">
        <span>{{ INGREDIENT_BY_ID.get(part.ingredientId)?.name }}</span>
        <strong>{{ part.share }}%</strong>
      </li>
    </ul>

    <div class="recipe-meta">
      <span>Exact {{ (candidate.score.match * 100).toFixed(4) }}%</span>
      <span>L1 distance {{ candidate.score.distance.toFixed(2) }}</span>
      <span>Best local trend: {{ crossScores.best.trend.name }}</span>
    </div>

    <TasteGrid :profile="candidate.score.profile" compact />

    <details class="calculation-details">
      <summary>How this score was calculated</summary>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Axis</th><th>Recipe</th><th>Target</th><th>Absolute error</th></tr></thead>
          <tbody>
            <tr v-for="item in candidate.score.errors" :key="item.axis">
              <th>{{ AXIS_LABELS[item.axis] }}</th><td>{{ item.recipe.toFixed(2) }}</td><td>{{ item.target.toFixed(2) }}</td><td>{{ item.error.toFixed(2) }}</td>
            </tr>
          </tbody>
          <tfoot><tr><th colspan="3">Total L1 distance</th><td>{{ candidate.score.distance.toFixed(2) }}</td></tr></tfoot>
        </table>
      </div>
      <p><code>match = clamp(1 − {{ candidate.score.distance.toFixed(2) }} / 28, 0, 1)</code></p>
      <p>The exact score ranks recipes. The game-facing value is rounded with <code>Math.round(match × 100)</code>.</p>
    </details>

    <button class="text-button" type="button" @click="copyRecipe">{{ copied ? 'Copied' : 'Copy recipe' }} <span aria-hidden="true">↗</span></button>
    <span class="sr-only" aria-live="polite">{{ copied ? 'Recipe copied to clipboard.' : '' }}</span>
  </article>
</template>

