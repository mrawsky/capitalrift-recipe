<script setup lang="ts">
import { locationFromLonLat, parseChunkIdInput, type ParsedLocation } from '../utils/domain/location'
import { generateTrends, trendSeed } from '../utils/domain/trends'
import { GAME_MODEL } from '../utils/domain/model'
import type { OptimizationResponse, Trend } from '../utils/domain/types'

const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const { optimize } = useRecipeOptimizer()

const location = ref<ParsedLocation | null>(null)
const trends = ref<Trend[]>([])
const optimization = ref<OptimizationResponse | null>(null)
const loading = ref(false)
const error = ref('')
const status = ref('Ready for a restaurant location ID.')
const shareCopied = ref(false)

const initialId = computed(() => typeof route.query.id === 'string' ? route.query.id : '')
const canonical = computed(() => runtimeConfig.public.siteUrl ? `${String(runtimeConfig.public.siteUrl).replace(/\/$/, '')}/` : undefined)

useSeoMeta({
  title: 'Capital Rift Recipe Generator — Local Trends & Match Scores',
  description: 'Turn a Capital Rift restaurant chunk ID into deterministic local food trends and transparent, best-found recipe recommendations.',
  ogTitle: 'Capital Rift Recipe Generator',
  ogDescription: 'Generate local trends, strong recipes, and exact match calculations from a restaurant chunk ID.',
  ogType: 'website',
  twitterCard: 'summary',
})

useHead(() => ({
  link: canonical.value ? [{ rel: 'canonical', href: canonical.value }] : [],
  script: [{
    type: 'application/ld+json',
    textContent: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Capital Rift Recipe Generator',
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any modern browser',
      description: 'An unofficial local recipe and trend calculator for Capital Rift.',
      isAccessibleForFree: true,
    }),
  }],
}))

async function generate(payload: { type: 'id', input: string } | { type: 'coordinates', longitude: number, latitude: number }) {
  error.value = ''
  optimization.value = null
  loading.value = true
  status.value = 'Normalizing the location and generating local trends.'

  try {
    const nextLocation = payload.type === 'id'
      ? parseChunkIdInput(payload.input)
      : locationFromLonLat(payload.longitude, payload.latitude)
    const nextTrends = generateTrends(nextLocation.locationKey)
    location.value = nextLocation
    trends.value = nextTrends
    await router.replace({ query: { id: nextLocation.originalId } })
    status.value = 'Searching deterministic recipe candidates. The page remains usable while the worker runs.'
    optimization.value = await optimize(nextLocation.locationKey, nextTrends)
    status.value = `Generated 12 best-found recipes from ${optimization.value.candidatesEvaluated.toLocaleString('en-US')} evaluated candidates.`
    await nextTick()
    document.querySelector('#calculation-chain')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to generate recipes for that location.'
    status.value = error.value
  }
  finally {
    loading.value = false
  }
}

async function copyShareLink() {
  await navigator.clipboard.writeText(window.location.href)
  shareCopied.value = true
  setTimeout(() => shareCopied.value = false, 1800)
}

onMounted(() => {
  if (initialId.value) generate({ type: 'id', input: initialId.value })
})
</script>

<template>
  <main id="main-content">
    <section class="hero">
      <div class="hero__meta">
        <span>UNOFFICIAL COMMUNITY TOOL</span>
        <span>MODEL {{ GAME_MODEL.label }}</span>
      </div>
      <h1>Cook for the<br><em>local appetite.</em></h1>
      <div class="hero__footer">
        <p>Turn a restaurant map ID into the exact local taste targets—and recipes built to meet them.</p>
        <a href="#generator" class="down-link">Start generating <span aria-hidden="true">↓</span></a>
      </div>
    </section>

    <GeneratorForm :loading="loading" :initial-id="initialId" @generate="generate" />

    <div class="status-region" aria-live="polite" aria-atomic="true">
      <p :class="{ error }">{{ status }}</p>
      <p v-if="error" class="error-detail">Check the value and make sure it identifies the restaurant chunk, not a neighboring map tile.</p>
    </div>

    <template v-if="location && trends.length">
      <section id="calculation-chain" class="chain-section" aria-labelledby="chain-title">
        <header class="section-heading">
          <p class="eyebrow accent">02 / CALCULATION CHAIN</p>
          <h2 id="chain-title">From one map tile to three complete targets.</h2>
          <p>The raw ID is reduced to the zoom-12 grid before the deterministic seed is built.</p>
        </header>
        <ol class="calculation-chain">
          <li><span>01 / INPUT</span><strong>{{ location.originalId }}</strong></li>
          <li><span>02 / LOCATION KEY</span><strong>{{ location.locationKey }}</strong></li>
          <li><span>03 / SEED</span><strong>{{ trendSeed(location.locationKey) }}</strong></li>
          <li><span>04 / TRENDS</span><strong>{{ trends.map(trend => trend.name).join(' · ') }}</strong></li>
        </ol>
        <div class="button-row share-row">
          <button class="button button--quiet" type="button" @click="copyShareLink">{{ shareCopied ? 'Link copied' : 'Copy share link' }}</button>
          <NuxtLink class="text-button" to="/methodology">Audit the method ↗</NuxtLink>
        </div>
        <span class="sr-only" aria-live="polite">{{ shareCopied ? 'Share link copied to clipboard.' : '' }}</span>
      </section>

      <TrendResults v-if="optimization" :trends="trends" :optimization="optimization" />
      <RecipeEditor v-if="optimization" :trends="trends" />
    </template>

    <section class="trust-section">
      <div>
        <p class="eyebrow accent">VERIFY, THEN SERVE</p>
        <h2>Exact mechanics.<br>Careful claims.</h2>
      </div>
      <div class="trust-copy">
        <p>The taste vectors, scoring formulas, and trend generator were recovered from client-side game code and checked against known in-game results.</p>
        <p>Recommendations optimize taste match only. They do not predict ingredient cost, supply, preparation time, station compatibility, or profit.</p>
        <NuxtLink class="button button--quiet" to="/methodology">Read how it works</NuxtLink>
      </div>
    </section>
  </main>
</template>
