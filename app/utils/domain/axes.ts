import type { TasteAxis, TasteProfile } from './types'

export const AXES = [
  'sweet',
  'salty',
  'sour',
  'bitter',
  'umami',
  'spice',
  'richness',
  'freshness',
] as const satisfies readonly TasteAxis[]

export const AXIS_LABELS: Readonly<Record<TasteAxis, string>> = {
  sweet: 'Sweet',
  salty: 'Salty',
  sour: 'Sour',
  bitter: 'Bitter',
  umami: 'Umami',
  spice: 'Spice',
  richness: 'Richness',
  freshness: 'Freshness',
}

export function createTasteProfile(values: readonly number[]): TasteProfile {
  if (values.length !== AXES.length) {
    throw new Error(`Expected ${AXES.length} taste values.`)
  }
  return Object.freeze(Object.fromEntries(AXES.map((axis, index) => [axis, values[index]])) as Record<TasteAxis, number>)
}

export function profileToArray(profile: TasteProfile): number[] {
  return AXES.map(axis => profile[axis])
}

