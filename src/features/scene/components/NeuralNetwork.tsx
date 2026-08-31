import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createNetworkLayout } from '@/features/scene/network/layout'
import { networkLinkDistance, networkMaxDegree, sceneColors } from '@/features/scene/data'

/**
 * The environment: a lattice of nodes wired to their neighbours, with signals
 * running along the wires.
 *
 * It is drawn in the same language as the pets — lit vertices joined by thin
 * lines — so an animal that wanders across the page reads as something this
 * network produced rather than as clip art dropped on top of it.
 *
 * Every frame writes straight into the geometry's own attribute buffers. At
 * these counts that is far cheaper than rebuilding geometry, and it costs
 * React nothing: no state changes at all while the scene is running.
 */

/** Signals in flight at once, as a fraction of the edge count. */
const pulseRatio = 0.12
const pulseSpeed = 0.55
/** Radius, in world units, within which the pointer brightens a node. */
const pointerRadius = 2.6

const pointerWorld = new THREE.Vector3()
const pointerRay = new THREE.Vector3()

interface Pulse {
  edge: number
  progress: number
  speed: number
}

export function NeuralNetwork({
  nodeCount,
  spread,
  energyRef,
}: {
  nodeCount: number
  spread: readonly [number, number, number]
  energyRef: RefObject<number>
}) {
  const layout = useMemo(
    () =>
      createNetworkLayout({
        nodeCount,
        spread,
        linkDistance: networkLinkDistance,
        maxDegree: networkMaxDegree,
      }),
    [nodeCount, spread],
  )

  const pulseCount = Math.max(6, Math.round(layout.edgeCount * pulseRatio))

  // Initial contents of each attribute. Once mounted these arrays belong to
  // the geometries, and the frame loop updates them through those refs.
  const initial = useMemo(
    () => ({
      nodes: new Float32Array(layout.positions),
      nodeColors: new Float32Array(layout.nodeCount * 3),
      edges: new Float32Array(layout.edgeCount * 6),
      pulses: new Float32Array(pulseCount * 3),
    }),
    [layout, pulseCount],
  )

  const nodeGeometry = useRef<THREE.BufferGeometry>(null)
  const edgeGeometry = useRef<THREE.BufferGeometry>(null)
  const pulseGeometry = useRef<THREE.BufferGeometry>(null)
  const edgeMaterial = useRef<THREE.LineBasicMaterial>(null)
  const nodeMaterial = useRef<THREE.PointsMaterial>(null)
  const pulseMaterial = useRef<THREE.PointsMaterial>(null)
  const pulsesRef = useRef<Pulse[]>([])

  // Signals are seeded here rather than during render: picking their starting
  // edges is random, and random belongs in an effect.
  useEffect(() => {
    pulsesRef.current = Array.from({ length: pulseCount }, () => ({
      edge: Math.floor(Math.random() * Math.max(1, layout.edgeCount)),
      progress: Math.random(),
      speed: pulseSpeed * (0.6 + Math.random() * 0.8),
    }))
  }, [pulseCount, layout.edgeCount])

  useFrame((state, delta) => {
    const nodeGeo = nodeGeometry.current
    const edgeGeo = edgeGeometry.current
    const pulseGeo = pulseGeometry.current
    if (!nodeGeo || !edgeGeo || !pulseGeo) return

    const nodeAttribute = nodeGeo.getAttribute('position')
    const colorAttribute = nodeGeo.getAttribute('color')
    const edgeAttribute = edgeGeo.getAttribute('position')
    const pulseAttribute = pulseGeo.getAttribute('position')
    const nodes = nodeAttribute.array as Float32Array
    const nodeColors = colorAttribute.array as Float32Array
    const edgePositions = edgeAttribute.array as Float32Array
    const pulsePositions = pulseAttribute.array as Float32Array

    const level = energyRef.current
    const step = Math.min(delta, 0.05)
    const time = state.clock.elapsedTime

    // Where the pointer crosses the z = 0 plane, for the proximity highlight.
    const camera = state.camera
    pointerRay.set(state.pointer.x, state.pointer.y, 0.5).unproject(camera).sub(camera.position)
    const toPlane = pointerRay.z === 0 ? 0 : -camera.position.z / pointerRay.z
    pointerWorld.copy(camera.position).addScaledVector(pointerRay, toPlane)

    // 1. Drift the nodes, and colour them by pointer proximity.
    for (let i = 0; i < layout.nodeCount; i++) {
      const p = i * 3
      const phase = layout.drift[i * 2]
      const rate = layout.drift[i * 2 + 1]
      const sway = 0.12 + level * 0.2
      nodes[p] = layout.positions[p] + Math.sin(time * rate + phase) * sway
      nodes[p + 1] = layout.positions[p + 1] + Math.cos(time * rate * 0.8 + phase) * sway
      nodes[p + 2] = layout.positions[p + 2] + Math.sin(time * rate * 0.6 + phase) * sway * 0.6

      const dx = nodes[p] - pointerWorld.x
      const dy = nodes[p + 1] - pointerWorld.y
      const near = Math.max(0, 1 - Math.hypot(dx, dy) / pointerRadius)
      // Base lime, lifting toward a pale green as the pointer approaches.
      const lift = near * near
      nodeColors[p] = 0.64 + lift * 0.36
      nodeColors[p + 1] = 0.9 + lift * 0.1
      nodeColors[p + 2] = 0.21 + lift * 0.5
    }

    // 2. Restring the edges from the drifted nodes.
    for (let e = 0; e < layout.edgeCount; e++) {
      const a = layout.edges[e * 2] * 3
      const b = layout.edges[e * 2 + 1] * 3
      const o = e * 6
      edgePositions[o] = nodes[a]
      edgePositions[o + 1] = nodes[a + 1]
      edgePositions[o + 2] = nodes[a + 2]
      edgePositions[o + 3] = nodes[b]
      edgePositions[o + 4] = nodes[b + 1]
      edgePositions[o + 5] = nodes[b + 2]
    }

    // 3. Run the signals along their edges, rehoming each one when it lands.
    const pulses = pulsesRef.current
    for (let i = 0; i < pulses.length; i++) {
      const pulse = pulses[i]
      pulse.progress += step * pulse.speed * (0.35 + level)
      if (pulse.progress > 1) {
        pulse.progress = 0
        pulse.edge = Math.floor(Math.random() * layout.edgeCount)
      }
      const a = layout.edges[pulse.edge * 2] * 3
      const b = layout.edges[pulse.edge * 2 + 1] * 3
      const t = pulse.progress
      const o = i * 3
      pulsePositions[o] = nodes[a] + (nodes[b] - nodes[a]) * t
      pulsePositions[o + 1] = nodes[a + 1] + (nodes[b + 1] - nodes[a + 1]) * t
      pulsePositions[o + 2] = nodes[a + 2] + (nodes[b + 2] - nodes[a + 2]) * t
    }

    nodeAttribute.needsUpdate = true
    colorAttribute.needsUpdate = true
    edgeAttribute.needsUpdate = true
    pulseAttribute.needsUpdate = true

    if (edgeMaterial.current) edgeMaterial.current.opacity = 0.05 + level * 0.34
    if (nodeMaterial.current) nodeMaterial.current.opacity = 0.15 + level * 0.75
    if (pulseMaterial.current) pulseMaterial.current.opacity = level * 0.95
  })

  return (
    <group>
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={edgeGeometry}>
          <bufferAttribute attach="attributes-position" args={[initial.edges, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={edgeMaterial}
          color={sceneColors.lime}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog
        />
      </lineSegments>

      <points frustumCulled={false}>
        <bufferGeometry ref={nodeGeometry}>
          <bufferAttribute attach="attributes-position" args={[initial.nodes, 3]} />
          <bufferAttribute attach="attributes-color" args={[initial.nodeColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={nodeMaterial}
          vertexColors
          size={0.075}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points frustumCulled={false}>
        <bufferGeometry ref={pulseGeometry}>
          <bufferAttribute attach="attributes-position" args={[initial.pulses, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={pulseMaterial}
          color={sceneColors.limeSoft}
          size={0.13}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
