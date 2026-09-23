<script setup lang="ts">
import { GAME_MODEL } from '../utils/domain/model'
</script>

<template>
  <footer class="site-footer">
    <div class="footer-main">
      <div class="footer-statement">
        <p class="eyebrow accent">OPEN METHOD / OPEN SOURCE</p>
        <p class="footer-title">Check the numbers.<br>Improve the tool.</p>
      </div>
      <div class="footer-actions">
        <NuxtLink to="/methodology" class="footer-link">
          <span>Read the methodology</span>
          <span aria-hidden="true">→</span>
        </NuxtLink>
        <a class="footer-link footer-link--github" href="https://github.com/mrawsky/capitalrift-recipe" target="_blank" rel="noopener noreferrer" aria-label="View Capital Rift Recipe Generator on GitHub (opens in a new tab)">
          <span class="footer-link__label">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>
            View on GitHub
          </span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-disclaimer">
        <p class="eyebrow">UNOFFICIAL COMMUNITY TOOL</p>
        <p>Not affiliated with Capital Rift or its developer or publisher.</p>
      </div>
      <span>MODEL / {{ GAME_MODEL.label }}</span>
      <a class="footer-credit" href="https://mrawsky.pro" target="_blank" rel="noopener noreferrer">made by mrawsky</a>
    </div>
  </footer>
</template>
