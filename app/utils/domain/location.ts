export const WEB_MERCATOR_MAX_LAT = 85.05112878
export const MAX_SAFE_TILE_ZOOM = 52

export interface ParsedLocation {
  originalId: string
  zoom: number
  tileX: number
  tileY: number
  locationKey: string
}

function validateTile(zoom: number, tileX: number, tileY: number): string | null {
  if (![zoom, tileX, tileY].every(Number.isSafeInteger)) return 'The zoom and tile coordinates must be safe integers.'
  if (zoom < 12) return 'The zoom must be 12 or higher so it can be normalized to the game trend grid.'
  if (zoom > MAX_SAFE_TILE_ZOOM) return `The zoom must be ${MAX_SAFE_TILE_ZOOM} or lower.`
  const limit = 2 ** zoom
  if (tileX < 0 || tileY < 0 || tileX >= limit || tileY >= limit) {
    return `Tile coordinates must be between 0 and ${limit - 1} at zoom ${zoom}.`
  }
  return null
}

export function normalizeLocation(zoom: number, tileX: number, tileY: number): ParsedLocation {
  const error = validateTile(zoom, tileX, tileY)
  if (error) throw new Error(error)
  const divisor = 2 ** (zoom - 12)
  const x12 = Math.floor(tileX / divisor)
  const y12 = Math.floor(tileY / divisor)
  return {
    originalId: `${zoom}/${tileX}/${tileY}`,
    zoom,
    tileX,
    tileY,
    locationKey: `12/${x12}/${y12}`,
  }
}

export function parseChunkIdInput(input: string): ParsedLocation {
  const matches = [...input.matchAll(/(^|[^\d])(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)(?=$|[^\d])/g)]
  if (matches.length === 0) throw new Error('Enter a location ID in zoom/tileX/tileY format, for example 15/18295/10789.')

  const values = matches.map(match => `${Number(match[2])}/${Number(match[3])}/${Number(match[4])}`)
  const unique = [...new Set(values)]
  if (unique.length > 1) throw new Error('More than one different location ID was found. Paste only the restaurant chunk ID.')

  const [zoom, tileX, tileY] = unique[0]!.split('/').map(Number)
  return normalizeLocation(zoom!, tileX!, tileY!)
}

export function locationFromLonLat(longitude: number, latitude: number): ParsedLocation {
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) throw new Error('Longitude and latitude must be valid numbers.')
  if (longitude < -180 || longitude > 180) throw new Error('Longitude must be between -180 and 180 degrees.')
  if (latitude < -WEB_MERCATOR_MAX_LAT || latitude > WEB_MERCATOR_MAX_LAT) {
    throw new Error(`Latitude must be between -${WEB_MERCATOR_MAX_LAT} and ${WEB_MERCATOR_MAX_LAT} degrees.`)
  }

  const zoom = 12
  const n = 2 ** zoom
  const tileX = Math.min(n - 1, Math.max(0, Math.floor(((longitude + 180) / 360) * n)))
  const latRad = latitude * Math.PI / 180
  const tileY = Math.min(n - 1, Math.max(0, Math.floor(((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n)))
  return normalizeLocation(zoom, tileX, tileY)
}

