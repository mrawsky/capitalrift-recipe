<script setup lang="ts">
import { AXIS_LABELS } from '../utils/domain/axes'
import type { OptimizationResponse, Trend } from '../utils/domain/types'

defineProps<{
  trends: Trend[]
  optimization: OptimizationResponse
}>()
</script>

<template>
  <section class="results-section" aria-labelledby="results-title">
    <header class="section-heading">
      <p class="eyebrow accent">03 / OPTIMIZED RECIPES</p>
      <h2 id="results-title">Twelve menu candidates, ranked by exact match.</h2>
      <p>Best found—not claimed as global optima. Every two-ingredient mix was checked exhaustively; larger recipes use deterministic refinement.</p>
    </header>

    <article v-for="trend in trends" :key="trend.index" class="trend-block">
      <header class="trend-header">
        <div>
          <p class="eyebrow">TREND {{ String(trend.index + 1).padStart(2, '0') }}</p>
          <h3>{{ trend.name }}</h3>
          <p>Primary {{ AXIS_LABELS[trend.primary] }} · Secondary {{ AXIS_LABELS[trend.secondary] }} · Boosted {{ AXIS_LABELS[trend.boosted] }}</p>
        </div>
        <TasteGrid :profile="trend.target" />
      </header>
      <div class="recipe-grid">
        <RecipeCard
          v-for="(candidate, index) in optimization.results.find(result => result.trendIndex === trend.index)?.candidates"
          :key="candidate.signature"
          :candidate="candidate"
          :trend="trend"
          :trends="trends"
          :rank="index + 1"
        />
      </div>
    </article>

    <footer class="search-metadata">
      <span>STATUS / {{ optimization.optimality.toUpperCase() }}</span>
      <span>STRATEGY / {{ optimization.strategy }}</span>
      <span>CANDIDATES / {{ optimization.candidatesEvaluated.toLocaleString('en-US') }}</span>
      <span>OPTIMIZER / {{ optimization.optimizerVersion }}</span>
    </footer>
  </section>
</template>

