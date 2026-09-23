import { AXES, AXIS_LABELS, createTasteProfile } from './axes'
import { eligiblePrimaryAxes } from './ingredients'
import { seededRandom } from './rng'
import type { TasteAxis, Trend } from './types'

export const TREND_SEED_VERSION = 1

export function trendSeed(locationKey: string): string {
  return `crtrend:${TREND_SEED_VERSION}:${locationKey}`
}

export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]!
}

export function generateTrends(locationKey: string): Trend[] {
  const random = seededRandom(trendSeed(locationKey))
  const eligible = eligiblePrimaryAxes()
  const usedPairs = new Set<string>()
  const trends: Trend[] = []

  for (let trendIndex = 0; trendIndex < 3; trendIndex++) {
    let primary: TasteAxis | undefined
    let secondary: TasteAxis | undefined

    for (let attempt = 0; attempt < 64; attempt++) {
      const candidatePrimary = pick(eligible, random)
      const candidateSecondary = pick(eligible.filter(axis => axis !== candidatePrimary), random)
      const pairKey = [candidatePrimary, candidateSecondary].sort().join('|')
      if (usedPairs.has(pairKey)) continue
      usedPairs.add(pairKey)
      primary = candidatePrimary
      secondary = candidateSecondary
      break
    }

    if (!primary || !secondary) throw new Error('Unable to generate a unique trend pair.')
    const boosted = pick(eligible.filter(axis => axis !== primary && axis !== secondary), random)
    const values = AXES.map(() => roundToHalf(random() * 2.5))
    values[AXES.indexOf(primary)] = roundToHalf(6.5 + random() * 2.5)
    values[AXES.indexOf(secondary)] = roundToHalf(5.5 + random() * 2.5)
    values[AXES.indexOf(boosted)] = roundToHalf(3 + random() * 2.5)

    trends.push({
      index: trendIndex,
      name: `${AXIS_LABELS[primary]} & ${AXIS_LABELS[secondary]}`,
      primary,
      secondary,
      boosted,
      target: createTasteProfile(values),
    })
  }

  return trends
}
