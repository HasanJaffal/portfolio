import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { stageEnergy, type SceneStage } from '@/features/scene/data'

/**
 * Owns the shared energy value and the camera.
 *
 * Every layer lerps against `energyRef` instead of reading the stage directly,
 * so a stage change glides over about a second rather than snapping. Keeping
 * it in a ref — updated inside the render loop — means the boot sequence can
 * drive the whole environment without re-rendering a single React component.
 */

const lookTarget = new THREE.Vector3(0, 0, -3)

export function CameraRig({ stage, energyRef }: { stage: SceneStage; energyRef: RefObject<number> }) {
  const target = stageEnergy[stage]
  // The camera eases in as the system wakes, so the lattice opens up.
  const dolly = useRef(7.2)

  useFrame((state, delta) => {
    const step = Math.min(delta, 0.05)
    energyRef.current = THREE.MathUtils.damp(energyRef.current, target, 1.6, step)
    dolly.current = THREE.MathUtils.damp(dolly.current, 7.2 - energyRef.current * 0.9, 1.1, step)

    // Parallax, scaled by energy so a cold screen stays perfectly still.
    const sway = energyRef.current
    const camera = state.camera
    camera.position.x = THREE.MathUtils.damp(camera.position.x, state.pointer.x * 0.75 * sway, 2.5, step)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, state.pointer.y * 0.45 * sway, 2.5, step)
    camera.position.z = dolly.current
    camera.lookAt(lookTarget)
  })

  return null
}
