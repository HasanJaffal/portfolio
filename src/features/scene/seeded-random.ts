/**
 * A small deterministic PRNG (mulberry32). The environment's layout is
 * generated rather than authored, but it must be the *same* environment on
 * every load — a portfolio that rearranges itself between refreshes reads as
 * a bug, not as a feature.
 */
export function seededRandom(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
