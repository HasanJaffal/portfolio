import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import { motion } from 'motion/react'
import { CameraRig } from '@/features/scene/components/CameraRig'
import { NeuralNetwork } from '@/features/scene/components/NeuralNetwork'
import { sceneColors, stageOpacity, type SceneStage } from '@/features/scene/data'
import type { SceneQuality } from '@/features/scene/hooks/use-scene-quality'
import { useDocumentVisible } from '@/lib/hooks/use-document-visible'
import { transitions } from '@/lib/motion'

/**
 * The environment behind the portfolio.
 *
 * Mounted once at the app root and kept alive for the session — the boot
 * sequence and the workspace are layered *over* the same running scene, so
 * moving between them, or between routes, is a change of foreground only.
 *
 * Nothing in here is interactive: the layer is `pointer-events-none` and
 * `aria-hidden`, so it can never intercept a click or reach a screen reader.
 * Props, not context, cross into `<Canvas>` — React context does not survive
 * the R3F reconciler boundary.
 *
 * This module is loaded lazily by SceneLayer, which is what keeps three.js
 * out of the initial bundle. Import it from there, not directly.
 */
export function SceneCanvas({ stage, quality }: { stage: SceneStage; quality: SceneQuality }) {
  const visible = useDocumentVisible()
  const energyRef = useRef(0)

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      initial={false}
      animate={{ opacity: stageOpacity[stage] }}
      transition={transitions.slow}
    >
      <Canvas
        // Parked entirely while the tab is in the background.
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, quality.maxDpr]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 7.2], fov: 55, near: 0.1, far: 60 }}
      >
        <fog attach="fog" args={[sceneColors.fog, 9, 30]} />
        <CameraRig stage={stage} energyRef={energyRef} />
        <NeuralNetwork nodeCount={quality.nodeCount} spread={quality.spread} energyRef={energyRef} />
        <AdaptiveDpr pixelated />
      </Canvas>
    </motion.div>
  )
}
