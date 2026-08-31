import { useCallback, useMemo, useRef } from 'react'
import { useAnimationFrame } from 'motion/react'
import { petFloorInset, petShapes, type PetSpecies } from '@/features/pets/data'

/**
 * One pet, walking the floor of the content area.
 *
 * The gait is procedural rather than keyframed: the body bobs and squashes on
 * each footfall, and for walking species the vertices below `legThreshold`
 * swing in antiphase, which is what makes it read as *walking* rather than
 * sliding. Everything is written straight to the DOM inside a single
 * animation frame, so a pet crossing the page costs React nothing.
 */

export interface PetInstance {
  id: number
  species: PetSpecies
  /** 1 walks right, -1 walks left. The drawing is mirrored to match. */
  direction: 1 | -1
  /** Where it enters, in px relative to the track's left edge. */
  startX: number
}

/** Fade in and out over this many px of travel. */
const fadeDistance = 90

interface PetProps {
  instance: PetInstance
  /** Width of the strip the pet walks along, in px. */
  trackWidth: number
  onDone: (id: number) => void
  onPoke: (species: PetSpecies) => void
}

export function Pet({ instance, trackWidth, onDone, onPoke }: PetProps) {
  const shape = petShapes[instance.species]
  const wrapperRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const outlineRef = useRef<SVGPolygonElement>(null)
  const nodesRef = useRef<SVGGElement>(null)

  const box = shape.size * 1.3
  const half = shape.size / 2

  // Drop the drawing so the lowest point of the outline rests on the floor
  // line, rather than wherever the bounding box happens to put it.
  const footOffset = useMemo(() => {
    let lowest = 0
    for (const [, y] of shape.outline) lowest = Math.min(lowest, y)
    return box / 2 + lowest * half
  }, [shape.outline, box, half])

  const elapsed = useRef(0)
  const distance = useRef(0)
  /** Ramps to 1 while the pointer is over the pet, and back down after. */
  const attention = useRef(0)
  const hovered = useRef(false)
  const pokedAt = useRef<number | null>(null)
  const finished = useRef(false)
  /** Seconds left in the current idle pause; 0 means it is on the move. */
  const restingFor = useRef(0)
  /** Null until the first frame seeds it — random belongs out of render. */
  const nextRestAt = useRef<number | null>(null)

  const travel = trackWidth + box * 2

  const poke = useCallback(() => {
    pokedAt.current = performance.now()
    onPoke(instance.species)
  }, [instance.species, onPoke])

  useAnimationFrame((_, deltaMs) => {
    const wrapper = wrapperRef.current
    const body = bodyRef.current
    const outline = outlineRef.current
    if (!wrapper || !body || !outline || finished.current) return

    // A backgrounded tab hands back one enormous delta; clamp it so pets
    // don't teleport across the page when you come back.
    const delta = Math.min(deltaMs, 50) / 1000
    elapsed.current += delta
    attention.current += ((hovered.current ? 1 : 0) - attention.current) * Math.min(1, delta * 8)

    // Idle pauses. A pet that only ever marches across reads as a screensaver.
    if (nextRestAt.current === null) nextRestAt.current = 3 + Math.random() * 5
    if (restingFor.current > 0) {
      restingFor.current -= delta
    } else if (shape.gait === 'walk' && elapsed.current > nextRestAt.current) {
      restingFor.current = 0.8 + Math.random() * 1.6
      nextRestAt.current = elapsed.current + 6 + Math.random() * 8
    }

    const resting = restingFor.current > 0
    // Resting pets stop; hovered ones slow down to look back at you.
    const pace = resting ? 0 : 1 - attention.current * 0.75
    distance.current += shape.speed * pace * delta

    if (distance.current > travel) {
      finished.current = true
      onDone(instance.id)
      return
    }

    const x = instance.startX + distance.current * instance.direction
    const step = distance.current / (shape.size * 0.42)

    let bob: number
    let roll: number
    let squash = 1
    if (shape.gait === 'walk') {
      // Two footfalls per stride, so the body dips twice each cycle.
      bob = resting ? Math.sin(elapsed.current * 2) : -Math.abs(Math.sin(step)) * shape.size * 0.05
      squash = resting ? 1 : 1 + Math.sin(step * 2) * 0.03
      roll = resting ? 0 : Math.sin(step) * 2.5
    } else {
      const beat = elapsed.current * (shape.gait === 'fly' ? 7 : 1.6)
      bob = Math.sin(beat) * shape.size * (shape.gait === 'fly' ? 0.16 : 0.1)
      roll = Math.sin(beat * 0.5) * (shape.gait === 'fly' ? 6 : 3)
    }

    // A poke makes it hop, then settle.
    let hop = 0
    if (pokedAt.current !== null) {
      const since = (performance.now() - pokedAt.current) / 1000
      if (since < 0.55) hop = -Math.sin((since / 0.55) * Math.PI) * shape.size * 0.42
      else pokedAt.current = null
    }

    const edge = Math.min(distance.current, travel - distance.current)
    wrapper.style.opacity = String(Math.max(0, Math.min(1, edge / fadeDistance)))
    wrapper.style.transform = `translate3d(${x}px, ${bob + hop}px, 0)`
    wrapper.style.setProperty('--pet-glow', (0.4 + attention.current * 0.6).toFixed(3))
    body.style.transform = `scaleX(${instance.direction}) rotate(${roll}deg)`

    // Redraw the outline with the legs swung to the current point in the step.
    let points = ''
    for (const [px, py] of shape.outline) {
      let ox = px
      if (shape.gait === 'walk' && !resting && py < shape.legThreshold) {
        // Front and back legs swing in antiphase; the throw tapers off for
        // vertices nearer the body.
        const back = px < 0 ? Math.PI : 0
        const reach = (shape.legThreshold - py) / (1 + shape.legThreshold)
        ox += Math.sin(step + back) * 0.26 * Math.max(0.4, reach)
      }
      points += `${(ox * half).toFixed(2)},${(-py * half * squash).toFixed(2)} `
    }
    outline.setAttribute('points', points)

    const nodes = nodesRef.current
    if (nodes) {
      const coords = points.trim().split(' ')
      const circles = nodes.children
      for (let i = 0; i < circles.length && i < coords.length; i++) {
        const [cx, cy] = coords[i].split(',')
        circles[i].setAttribute('cx', cx)
        circles[i].setAttribute('cy', cy)
      }
    }
  })

  return (
    <div
      ref={wrapperRef}
      className="absolute left-0 opacity-0 will-change-transform"
      style={{ bottom: shape.hover * shape.size + petFloorInset - footOffset }}
    >
      <div ref={bodyRef} style={{ transform: `scaleX(${instance.direction})` }}>
        <svg
          width={box}
          height={box}
          viewBox={`${-box / 2} ${-box / 2} ${box} ${box}`}
          role="img"
          aria-label={`A ${shape.label} wanders past`}
          className="pointer-events-auto cursor-pointer overflow-visible"
          style={{
            filter: 'drop-shadow(0 0 6px color-mix(in oklab, var(--color-lime) 50%, transparent))',
          }}
          onPointerEnter={() => {
            hovered.current = true
          }}
          onPointerLeave={() => {
            hovered.current = false
          }}
          onPointerDown={poke}
        >
          {/* A generous invisible target: the outline itself is far too thin
              to hit reliably, and a pet you cannot poke is not a pet. */}
          <circle r={box / 2} fill="transparent" />
          <polygon
            ref={outlineRef}
            points=""
            fill="none"
            stroke="var(--color-lime)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            style={{ opacity: 'calc(0.5 + var(--pet-glow, 0.4) * 0.5)' }}
          />
          <g ref={nodesRef} fill="var(--color-lime-soft)" style={{ opacity: 'var(--pet-glow, 0.4)' }}>
            {shape.outline.map((_, i) => (
              <circle key={i} r={1.5} />
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
