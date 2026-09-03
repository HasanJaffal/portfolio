import { useMemo } from 'react'
import { motion } from 'motion/react'
import {
  networkLinkDistance,
  networkMaxDegree,
  networkSpread,
  stageOpacity,
  type SceneStage,
} from '@/features/scene/data'
import { createNetworkLayout } from '@/features/scene/network/layout'
import { transitions } from '@/lib/motion'

/**
 * What the environment looks like without a canvas — for reduced-motion
 * visitors and machines with no WebGL.
 *
 * It is built from the same layout generator as the live lattice and drawn
 * flat as SVG, so those visitors get the same design holding still rather
 * than a different backdrop entirely. No three.js is loaded to render it.
 */

/** A viewBox in the rough proportions of a wide viewport. */
const viewWidth = 160
const viewHeight = 90

export function SceneFallback({ stage }: { stage: SceneStage }) {
  const layout = useMemo(
    () =>
      createNetworkLayout({
        nodeCount: 120,
        spread: [networkSpread.wide[0], networkSpread.wide[1], 0],
        linkDistance: networkLinkDistance,
        maxDegree: networkMaxDegree,
      }),
    [],
  )

  // Map the layout's world units onto the viewBox.
  const project = (index: number): [number, number] => [
    viewWidth / 2 + (layout.positions[index * 3] / networkSpread.wide[0]) * (viewWidth / 2),
    viewHeight / 2 - (layout.positions[index * 3 + 1] / networkSpread.wide[1]) * (viewHeight / 2),
  ]

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      initial={false}
      animate={{ opacity: stageOpacity[stage] }}
      transition={transitions.slow}
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="var(--color-lime)" strokeWidth={0.14} opacity={0.28}>
          {Array.from({ length: layout.edgeCount }, (_, e) => {
            const [x1, y1] = project(layout.edges[e * 2])
            const [x2, y2] = project(layout.edges[e * 2 + 1])
            return <line key={e} x1={x1} y1={y1} x2={x2} y2={y2} />
          })}
        </g>
        <g fill="var(--color-lime)" opacity={0.5}>
          {Array.from({ length: layout.nodeCount }, (_, i) => {
            const [cx, cy] = project(i)
            return <circle key={i} cx={cx} cy={cy} r={0.42} />
          })}
        </g>
      </svg>
      <div className="bg-radial-fade absolute inset-0" />
    </motion.div>
  )
}
