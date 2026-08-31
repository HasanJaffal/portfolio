import { lazy, Suspense } from 'react'
import { SceneFallback } from '@/features/scene/components/SceneFallback'
import { useSceneQuality } from '@/features/scene/hooks/use-scene-quality'
import type { SceneStage } from '@/features/scene/data'

/**
 * The environment's entry point, and the boundary that decides whether
 * three.js is downloaded at all.
 *
 * Devices on the `off` tier — reduced motion, or no WebGL — never request
 * the chunk; they get the static backdrop and are done. Everyone else gets
 * the same backdrop while the renderer streams in, then the live scene
 * replaces it. Either way the portfolio itself is interactive immediately:
 * nothing in the boot sequence or the terminal waits on this.
 */
const SceneCanvas = lazy(() =>
  import('@/features/scene/components/SceneCanvas').then((module) => ({
    default: module.SceneCanvas,
  })),
)

export function SceneLayer({ stage }: { stage: SceneStage }) {
  const quality = useSceneQuality()

  if (quality.tier === 'off') return <SceneFallback stage={stage} />

  return (
    <Suspense fallback={<SceneFallback stage={stage} />}>
      <SceneCanvas stage={stage} quality={quality} />
    </Suspense>
  )
}
