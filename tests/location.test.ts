import { describe, expect, it } from 'vitest'
import { locationFromLonLat, normalizeLocation, parseChunkIdInput } from '../app/utils/domain/location'

describe('location input', () => {
  it('normalizes the verified fixture to zoom 12', () => {
    expect(parseChunkIdInput('15/18295/10789')).toMatchObject({
      originalId: '15/18295/10789',
      locationKey: '12/2286/1348',
    })
  })

  it('extracts a single ID from surrounding text and tolerates whitespace', () => {
    expect(parseChunkIdInput('{ "chunkId": "15 / 18295 / 10789" }').locationKey).toBe('12/2286/1348')
    expect(parseChunkIdInput('{ "ref": "player/03d34d26", "chunkId": "15/18179/10741", "label": "Shops" }').originalId).toBe('15/18179/10741')
  })

  it('accepts repeated identical IDs but rejects ambiguous values', () => {
    expect(parseChunkIdInput('15/18295/10789 then 15/18295/10789').locationKey).toBe('12/2286/1348')
    expect(() => parseChunkIdInput('15/18295/10789 and 15/18296/10789')).toThrow(/More than one/)
  })

  it('rejects malformed, low-zoom, and out-of-range tiles', () => {
    expect(() => parseChunkIdInput('no tile here')).toThrow(/zoom\/tileX\/tileY/)
    expect(() => normalizeLocation(11, 1, 1)).toThrow(/12 or higher/)
    expect(() => normalizeLocation(12, 4096, 0)).toThrow(/between 0 and 4095/)
    expect(() => normalizeLocation(53, 0, 0)).toThrow(/52 or lower/)
  })

  it('converts valid coordinates and enforces Web Mercator bounds', () => {
    expect(locationFromLonLat(0, 0).locationKey).toBe('12/2048/2048')
    expect(locationFromLonLat(180, 0).locationKey).toBe('12/4095/2048')
    expect(() => locationFromLonLat(181, 0)).toThrow(/Longitude/)
    expect(() => locationFromLonLat(0, 86)).toThrow(/Latitude/)
  })
})
