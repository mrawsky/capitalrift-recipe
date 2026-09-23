<script setup lang="ts">
import { AXES, AXIS_LABELS } from '../utils/domain/axes'
import type { TasteProfile } from '../utils/domain/types'

defineProps<{
  profile: TasteProfile
  compact?: boolean
}>()
</script>

<template>
  <dl class="taste-grid" :class="{ 'taste-grid--compact': compact }">
    <div v-for="axis in AXES" :key="axis" class="taste-cell">
      <dt>{{ AXIS_LABELS[axis] }}</dt>
      <dd>{{ Number.isInteger(profile[axis]) ? profile[axis] : profile[axis].toFixed(2).replace(/0$/, '') }}</dd>
    </div>
  </dl>
</template>

