<script setup lang="ts">
import { GAME_MODEL } from '../utils/domain/model'

const runtimeConfig = useRuntimeConfig()
const canonical = computed(() => runtimeConfig.public.siteUrl ? `${String(runtimeConfig.public.siteUrl).replace(/\/$/, '')}/methodology` : undefined)

useSeoMeta({
  title: 'Methodology — Capital Rift Recipe Generator',
  description: 'Where to find a Capital Rift chunk ID and how location normalization, local trends, recipe profiles, match, and popularity are calculated.',
  ogTitle: 'Capital Rift Recipe Generator Methodology',
  ogDescription: 'A transparent explanation of the recovered local trend and recipe scoring mechanics.',
  ogType: 'article',
})
useHead(() => ({ link: canonical.value ? [{ rel: 'canonical', href: canonical.value }] : [] }))
</script>

<template>
  <main id="main-content" class="methodology-page">
    <header class="methodology-hero">
      <p class="eyebrow accent">DOCUMENTATION / MODEL {{ GAME_MODEL.label }}</p>
      <h1>Every number,<br><em>in the open.</em></h1>
      <p>This page separates verified mechanics from practical recommendations, so you can reproduce the calculation and spot changes after a game patch.</p>
    </header>

    <div class="methodology-layout">
      <aside class="methodology-nav" aria-label="On this page">
        <p class="eyebrow">ON THIS PAGE</p>
        <a href="#find-id">Find your ID</a>
        <a href="#normalization">Location normalization</a>
        <a href="#trends">Local trends</a>
        <a href="#profiles">Recipe profiles</a>
        <a href="#match">Match & popularity</a>
        <a href="#example">Worked example</a>
        <a href="#limits">Limitations & updates</a>
        <a href="#faq">FAQ</a>
      </aside>

      <article class="prose">
        <section id="find-id">
          <p class="eyebrow accent">01 / WHERE TO FIND YOUR LOCATION ID</p>
          <h2>Open <code>building-info</code>, then read the Response.</h2>
          <p>The supplied Capital Rift Network capture gives us a more precise route than searching every map request. Selecting a building produces a request beginning <code>building-info?ref=player%2F…</code>; its Response JSON exposes <code>chunkId</code> near the top level.</p>
          <ChunkIdGuide />
          <div class="copy-target">
            <p class="eyebrow">COPY THIS</p>
            <code>15/18179/10741</code>
            <p>Do not copy the player reference, quotation marks, label, or the request URL. The generator needs only the three-number tile value.</p>
          </div>
          <h3>If the request is missing</h3>
          <ul>
            <li>Keep the Network panel open, return to the game, and select the building again.</li>
            <li>Clear the Network list or filter for <code>building-info</code> so older requests do not obscure the newest one.</li>
            <li>Choose the request created at the moment you opened the intended restaurant, then verify its response describes that building.</li>
          </ul>
          <p class="callout">The diagram above is a code-built transcription of the real player-supplied Network capture. Request names and response fields may change after a game update.</p>
        </section>

        <section id="normalization">
          <p class="eyebrow accent">02 / LOCATION NORMALIZATION</p>
          <h2>Every location is reduced to zoom 12.</h2>
          <p>For <code>z/x/y</code>, the game calculates a power-of-two divisor from <code>z − 12</code>, floors both tile coordinates, and builds <code>12/x12/y12</code>. Locations inside the same zoom-12 tile therefore share all three trends.</p>
          <pre><code>15/18295/10789
divisor = 2 ** (15 - 12) = 8
x12 = floor(18295 / 8) = 2286
y12 = floor(10789 / 8) = 1348
locationKey = 12/2286/1348</code></pre>
          <p>When only coordinates are available, the fallback converts longitude and latitude to a standard zoom-12 Web Mercator tile. The raw restaurant ID remains preferred because coordinates near a tile boundary can select the wrong side.</p>
        </section>

        <section id="trends">
          <p class="eyebrow accent">03 / LOCAL TREND GENERATION</p>
          <h2>A name is only the headline.</h2>
          <p>The seed is exactly <code>crtrend:1:&lt;locationKey&gt;</code>. An xmur3-style hash initializes Mulberry32. Its random-call order is part of the behavior.</p>
          <p>Three trends are created. Each gets two distinct primary axes, one additional boosted axis, and baseline values on all eight axes. Unordered primary pairs cannot repeat. Primary eligibility is derived from the ingredient table: an axis needs a known ingredient value of at least 6. Bitter currently fails that threshold, but it still receives a baseline target value.</p>
          <p>Two locations can both show “Sour & Sweet” while differing on their other six values. Optimizing the title alone is therefore incorrect.</p>
        </section>

        <section id="profiles">
          <p class="eyebrow accent">04 / RECIPE PROFILES</p>
          <h2>Eight weighted averages, rounded first.</h2>
          <p>A valid in-game recipe uses 2–8 known ingredients. Shares are whole numbers from 1 to 100 and total exactly 100. There is no 5% step rule. The game validator also requires one of six station values, but available station compatibility is not known.</p>
          <pre><code>profile[axis] = sum(ingredient[axis] * share) / sum(shares)
profile[axis] = Math.round(profile[axis] * 100) / 100</code></pre>
          <p>The rounded profile—not the unrounded intermediate value—is used for match calculation.</p>
        </section>

        <section id="match">
          <p class="eyebrow accent">05 / MATCH & POPULARITY</p>
          <h2>All eight errors matter.</h2>
          <pre><code>distance = sum(abs(recipeProfile[axis] - trendTarget[axis]))
match = clamp(1 - distance / 28, 0, 1)
uiMatchPercent = Math.round(match * 100)

popularityMultiplier = 1 + 0.25 * clamp(match, 0, 1) ** 1.6</code></pre>
          <p>The overall popularity bonus uses the best match across the three local trends. The exact score ranks recommendations even when two recipes round to the same integer in the game UI.</p>
        </section>

        <section id="example">
          <p class="eyebrow accent">06 / WORKED EXAMPLE</p>
          <h2>Ketchup 50% + Vinegar 50%.</h2>
          <p>For <code>12/2286/1348</code>, the first target is Sour & Sweet: <code>(5.5, 1, 9, 0.5, 1.5, 5, 0, 1.5)</code>.</p>
          <p>The recipe profile is <code>(3.5, 2, 7.5, 0.5, 1.5, 0.5, 0, 1.5)</code>. Its per-axis absolute errors sum to 9, so:</p>
          <pre><code>match = 1 - 9 / 28
= 0.6785714286
= 67.85714286%
game display = 68%
popularity display = +13%</code></pre>
          <p>The same recipe displays 27% / +3% for Salty & Richness and 16% / +1% for Richness & Spice.</p>
        </section>

        <section id="limits">
          <p class="eyebrow accent">07 / LIMITATIONS & GAME UPDATES</p>
          <h2>Taste match is not business performance.</h2>
          <p>This tool does not model cost, inventory, supply, preparation time, station compatibility, pricing, profit, or availability. A field called <code>recipe</code> found in cart state represented the “Secret Recipe” upgrade, not a dish composition; restaurant menu data was empty in the inspected snapshot.</p>
          <p>After a patch, re-check the ingredient table, recipe validation, seed version, hash and PRNG constants, eligibility threshold, formulas, and rounding. Reproducing the three known trend names should happen before any new optimization is trusted.</p>
          <p class="callout">Source confidence: algorithms and vectors were recovered from client JavaScript; key outputs were partially confirmed in the game UI. Generated names and search recommendations are tool output, not game-provided content.</p>
        </section>

        <section id="faq">
          <p class="eyebrow accent">08 / FAQ</p>
          <h2>Practical answers.</h2>
          <details><summary>Does the tool contact the game?</summary><p>No. The generator, trend calculation, scoring, and search run locally in your browser.</p></details>
          <details><summary>Why do nearby restaurants show the same trends?</summary><p>They can normalize to the same zoom-12 tile, and therefore the same seed.</p></details>
          <details><summary>Is the first recipe globally optimal?</summary><p>No global claim is made. All two-ingredient recipes are checked exhaustively; larger mixes are refined deterministically and labeled best found.</p></details>
          <details><summary>Why does my in-game number differ after an update?</summary><p>The developer may have changed an ingredient vector, seed version, generation constant, or scoring rule. Verify the model version and re-check the known fixture.</p></details>
        </section>
      </article>
    </div>
  </main>
</template>
