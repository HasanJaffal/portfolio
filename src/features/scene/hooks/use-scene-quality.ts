import { useMemo } from 'react'
import { networkSpread } from '@/features/scene/data'
import { useIsDesktop, usePrefersReducedMotion } from '@/lib/hooks/use-media-query'

/**
 * Picks how much environment this device should be asked to draw.
 *
 * `off` is a real tier, not a failure: reduced-motion visitors and machines
 * without WebGL get a static backdrop built from the same lattice, and every
 * other part of the portfolio behaves identically.
 */

export type SceneTier = 'off' | 'low' | 'high'

export interface SceneQuality {
  tier: SceneTier
  /** Nodes in the lattice. Edges follow from the layout. */
  nodeCount: number
  /** Half-extents of the slab they fill, matched to this viewport's frustum. */
  spread: readonly [number, number, number]
  /** Upper bound for the renderer's pixel ratio. */
  maxDpr: number
}

const presets: Record<SceneTier, SceneQuality> = {
  off: { tier: 'off', nodeCount: 0, spread: networkSpread.narrow, maxDpr: 1 },
  low: { tier: 'low', nodeCount: 130, spread: networkSpread.narrow, maxDpr: 1.25 },
  high: { tier: 'high', nodeCount: 260, spread: networkSpread.wide, maxDpr: 1.75 },
}

let webglSupport: boolean | null = null

function supportsWebGL(): boolean {
  if (webglSupport !== null) return webglSupport
  try {
    const probe = document.createElement('canvas')
    webglSupport = Boolean(probe.getContext('webgl2') ?? probe.getContext('webgl'))
  } catch {
    webglSupport = false
  }
  return webglSupport
}

function isLowPowerDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number }
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) return true
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) return true
  return false
}

export function useSceneQuality(): SceneQuality {
  const reduceMotion = usePrefersReducedMotion()
  const isDesktop = useIsDesktop()

  return useMemo(() => {
    if (reduceMotion || !supportsWebGL()) return presets.off
    return isDesktop && !isLowPowerDevice() ? presets.high : presets.low
  }, [reduceMotion, isDesktop])
}
