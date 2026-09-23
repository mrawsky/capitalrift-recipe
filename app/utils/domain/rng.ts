export function seedHash(text: string): () => number {
  let state = 1779033703 ^ text.length
  for (let index = 0; index < text.length; index++) {
    state = Math.imul(state ^ text.charCodeAt(index), 3432918353)
    state = (state << 13) | (state >>> 19)
  }
  return () => {
    state = Math.imul(state ^ (state >>> 16), 2246822507)
    state = Math.imul(state ^ (state >>> 13), 3266489909)
    state ^= state >>> 16
    return state >>> 0
  }
}

export function mulberry32(initialState: number): () => number {
  let state = initialState
  return () => {
    state |= 0
    state = (state + 1831565813) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function seededRandom(seed: string): () => number {
  return mulberry32(seedHash(seed)())
}

