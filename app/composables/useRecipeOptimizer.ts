import { optimizeRecipes } from '../utils/domain/optimizer'
import { GAME_MODEL } from '../utils/domain/model'
import type { OptimizationRequest, OptimizationResponse, Trend } from '../utils/domain/types'

const CACHE_KEY = 'capital-rift-recipe-cache-v1'
const MAX_CACHE_ENTRIES = 20

interface CacheEntry {
  key: string
  value: OptimizationResponse
  savedAt: number
}

function readCache(): CacheEntry[] {
  if (!import.meta.client) return []
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  }
  catch {
    return []
  }
}

function writeCache(entries: CacheEntry[]) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries.slice(0, MAX_CACHE_ENTRIES)))
  }
  catch {
    // Storage can be unavailable in privacy modes; search still works without it.
  }
}

export function useRecipeOptimizer() {
  let activeWorker: Worker | null = null

  onBeforeUnmount(() => activeWorker?.terminate())

  async function optimize(locationKey: string, trends: Trend[]): Promise<OptimizationResponse> {
    const key = `${locationKey}:${GAME_MODEL.cacheKey}:1.0.0`
    const cached = readCache().find(entry => entry.key === key)
    if (cached?.value?.results?.length === 3) return cached.value

    const requestId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    const request: OptimizationRequest = { requestId, trends, recipesPerTrend: 4 }

    let response: OptimizationResponse
    try {
      response = await new Promise<OptimizationResponse>((resolve, reject) => {
        activeWorker?.terminate()
        const worker = new Worker(new URL('../workers/recipe-optimizer.worker.ts', import.meta.url), { type: 'module' })
        activeWorker = worker
        worker.onmessage = (event) => {
          if (event.data?.requestId && event.data.requestId !== requestId) return
          worker.terminate()
          activeWorker = null
          if (event.data?.type === 'success') resolve(event.data.payload)
          else reject(new Error(event.data?.message ?? 'Recipe search failed.'))
        }
        worker.onerror = () => {
          worker.terminate()
          activeWorker = null
          reject(new Error('Recipe worker could not start.'))
        }
        worker.postMessage(request)
      })
    }
    catch {
      await new Promise(resolve => setTimeout(resolve, 0))
      response = optimizeRecipes({ ...request, pairOnly: true })
    }

    const next = [{ key, value: response, savedAt: Date.now() }, ...readCache().filter(entry => entry.key !== key)]
    writeCache(next)
    return response
  }

  return { optimize }
}
