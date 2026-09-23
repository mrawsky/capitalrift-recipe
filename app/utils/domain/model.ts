/**
 * Single source of truth for the game mechanics snapshot used by the app.
 * Update this object when the ingredient table or recovered game formulas are
 * verified against a new Capital Rift build.
 */
export const GAME_MODEL = Object.freeze({
  date: '2026-09-23',
  gameVersion: 'v413',
  label: '2026-09-23 / v413',
  cacheKey: '2026-09-23-v413',
} as const)

