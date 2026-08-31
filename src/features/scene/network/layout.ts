import { seededRandom } from '@/features/scene/seeded-random'

/**
 * The network behind everything.
 *
 * Nodes are laid out on a jittered grid rather than at pure random — random
 * points clump, leaving bald patches and dense knots, and a background that
 * is visibly denser in one corner reads as a mistake. The grid guarantees
 * even coverage; the jitter keeps it from looking like graph paper.
 *
 * The layout is deterministic and shared: the WebGL layer and the static
 * reduced-motion backdrop both build from this, so the two tiers show the
 * same constellation rather than two unrelated designs.
 */

export interface NetworkLayout {
  nodeCount: number
  /** Resting position of each node, as xyz triples. */
  positions: Float32Array
  /** Node index pairs, two entries per edge. */
  edges: Uint32Array
  edgeCount: number
  /** Per-node drift phase and rate, as (phase, rate) pairs. */
  drift: Float32Array
}

export interface NetworkOptions {
  nodeCount: number
  /** Half-extents of the slab the nodes fill: x, y, z. */
  spread: readonly [number, number, number]
  /** Nodes closer than this may be linked. */
  linkDistance: number
  /** Cap on links per node, so dense pockets never turn into a solid blob. */
  maxDegree: number
  seed?: number
}

export function createNetworkLayout({
  nodeCount,
  spread,
  linkDistance,
  maxDegree,
  seed = 0x1f5a,
}: NetworkOptions): NetworkLayout {
  const random = seededRandom(seed)
  const [spreadX, spreadY, spreadZ] = spread

  // A grid whose cells are roughly square in x/y, sized to hold every node.
  const columns = Math.max(2, Math.round(Math.sqrt((nodeCount * spreadX) / spreadY)))
  const rows = Math.ceil(nodeCount / columns)
  const cellX = (spreadX * 2) / columns
  const cellY = (spreadY * 2) / rows

  const positions = new Float32Array(nodeCount * 3)
  const drift = new Float32Array(nodeCount * 2)

  for (let i = 0; i < nodeCount; i++) {
    const column = i % columns
    const row = Math.floor(i / columns)
    positions[i * 3] = -spreadX + (column + 0.5 + (random() - 0.5) * 0.85) * cellX
    positions[i * 3 + 1] = -spreadY + (row + 0.5 + (random() - 0.5) * 0.85) * cellY
    positions[i * 3 + 2] = -random() * spreadZ
    drift[i * 2] = random() * Math.PI * 2
    drift[i * 2 + 1] = 0.25 + random() * 0.5
  }

  const edges: number[] = []
  const degree = new Uint8Array(nodeCount)
  const neighbours: { index: number; distance: number }[] = []

  for (let a = 0; a < nodeCount; a++) {
    if (degree[a] >= maxDegree) continue
    neighbours.length = 0

    for (let b = a + 1; b < nodeCount; b++) {
      if (degree[b] >= maxDegree) continue
      const dx = positions[a * 3] - positions[b * 3]
      const dy = positions[a * 3 + 1] - positions[b * 3 + 1]
      const dz = positions[a * 3 + 2] - positions[b * 3 + 2]
      const distance = Math.hypot(dx, dy, dz)
      if (distance <= linkDistance) neighbours.push({ index: b, distance })
    }

    // Nearest first, so a node links to the neighbours it looks connected to.
    neighbours.sort((l, r) => l.distance - r.distance)
    for (const neighbour of neighbours) {
      if (degree[a] >= maxDegree) break
      if (degree[neighbour.index] >= maxDegree) continue
      edges.push(a, neighbour.index)
      degree[a]++
      degree[neighbour.index]++
    }
  }

  return {
    nodeCount,
    positions,
    edges: Uint32Array.from(edges),
    edgeCount: edges.length / 2,
    drift,
  }
}
