import { optimizeRecipes } from '../utils/domain/optimizer'
import type { OptimizationRequest } from '../utils/domain/types'

self.onmessage = (event: MessageEvent<OptimizationRequest>) => {
  try {
    self.postMessage({ type: 'success', payload: optimizeRecipes(event.data) })
  }
  catch (error) {
    self.postMessage({ type: 'error', requestId: event.data.requestId, message: error instanceof Error ? error.message : 'Recipe search failed.' })
  }
}

