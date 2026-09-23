<script setup lang="ts">
import { INGREDIENTS, INGREDIENT_BY_ID } from '../utils/domain/ingredients'
import { scoreRecipeAcrossTrends, validateRecipeComposition } from '../utils/domain/scoring'
import type { RecipePart, Trend } from '../utils/domain/types'

const props = defineProps<{ trends: Trend[] }>()
const rows = ref<RecipePart[]>([
  { ingredientId: 'KETCHUP', share: 50 },
  { ingredientId: 'VINEGAR', share: 50 },
])
const copied = ref(false)
const total = computed(() => rows.value.reduce((sum, row) => sum + Number(row.share || 0), 0))
const errors = computed(() => validateRecipeComposition(rows.value.map(row => ({ ...row, share: Number(row.share) }))))
const result = computed(() => errors.value.length ? null : scoreRecipeAcrossTrends(rows.value, props.trends))

function addRow() {
  const next = INGREDIENTS.find(ingredient => !rows.value.some(row => row.ingredientId === ingredient.id))
  if (next && rows.value.length < 8) rows.value.push({ ingredientId: next.id, share: 1 })
}

function removeRow(index: number) {
  if (rows.value.length > 2) rows.value.splice(index, 1)
}

async function copyCustomRecipe() {
  if (!result.value) return
  const text = rows.value.map(row => `${INGREDIENT_BY_ID.get(row.ingredientId)?.name}: ${row.share}%`).join('\n')
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => copied.value = false, 1800)
}
</script>

<template>
  <section class="editor-section" aria-labelledby="editor-title">
    <header class="section-heading">
      <p class="eyebrow accent">04 / RECIPE CHECKER</p>
      <h2 id="editor-title">Edit a mix and score it live.</h2>
      <p>Use 2–8 unique ingredients and whole percentages totaling exactly 100. Station compatibility is not part of the verified scoring model.</p>
    </header>

    <div class="editor-layout">
      <div class="editor-controls">
        <div v-for="(row, index) in rows" :key="index" class="editor-row">
          <label :for="`ingredient-${index}`" class="sr-only">Ingredient {{ index + 1 }}</label>
          <select :id="`ingredient-${index}`" v-model="row.ingredientId">
            <option v-for="ingredient in INGREDIENTS" :key="ingredient.id" :value="ingredient.id">{{ ingredient.name }}</option>
          </select>
          <label :for="`share-${index}`" class="sr-only">Percentage for ingredient {{ index + 1 }}</label>
          <input :id="`share-${index}`" v-model.number="row.share" type="number" min="1" max="100" step="1">
          <span>%</span>
          <button type="button" :disabled="rows.length <= 2" :aria-label="`Remove ingredient ${index + 1}`" @click="removeRow(index)">×</button>
        </div>
        <div class="editor-actions">
          <button class="button button--quiet" type="button" :disabled="rows.length >= 8" @click="addRow">Add ingredient</button>
          <strong :class="{ invalid: total !== 100 }">Total {{ total }}%</strong>
        </div>
        <ul v-if="errors.length" class="error-list" aria-live="polite">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>

      <div class="editor-output" aria-live="polite">
        <template v-if="result">
          <div class="editor-score" v-for="item in result.scores" :key="item.trend.index" :class="{ best: item.trend.index === result.best.trend.index }">
            <span>{{ item.trend.name }}</span>
            <strong>{{ item.score.uiMatchPercent }}%</strong>
            <small>+{{ item.score.uiPopularityBonusPercent }}% popularity · exact {{ (item.score.match * 100).toFixed(4) }}%</small>
          </div>
          <button class="text-button" type="button" @click="copyCustomRecipe">{{ copied ? 'Copied' : 'Copy custom recipe' }} ↗</button>
        </template>
        <p v-else class="empty-state">Complete a valid recipe to calculate all three local matches.</p>
      </div>
    </div>
  </section>
</template>

