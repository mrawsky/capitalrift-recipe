<script setup lang="ts">
import { GAME_MODEL } from '../utils/domain/model'
</script>

<template>
  <header class="site-header">
    <NuxtLink class="brand" to="/" aria-label="Capital Rift Recipe Lab home">
      <span>CAPITAL RIFT</span>
      <small>RECIPE LAB</small>
    </NuxtLink>
    <nav aria-label="Primary navigation">
      <NuxtLink to="/#generator">Generator</NuxtLink>
      <NuxtLink to="/methodology">Methodology</NuxtLink>
    </nav>
    <span class="model-stamp">MODEL / {{ GAME_MODEL.label }}</span>
  </header>
</template>
