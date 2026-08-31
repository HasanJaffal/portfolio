import { useCallback, useEffect, useRef, useState } from 'react'
import { useSound } from '@/features/audio'
import { Pet, type PetInstance } from '@/features/pets/components/Pet'
import { petSchedule, petShapes, petSpecies, type PetSpecies } from '@/features/pets/data'
import { onSummonPet } from '@/features/pets/pet-bus'
import { usePrefersReducedMotion } from '@/lib/hooks/use-media-query'

/**
 * The strip along the bottom of the content area that pets walk across.
 *
 * The layer itself is inert — `pointer-events-none`, `aria-hidden` — and only
 * each pet's own hit target opts back in, so the pets can be poked without the
 * band ever swallowing a click meant for the page behind it.
 *
 * How many share the floor is capped, and the schedule is deliberately slow:
 * a pet is a thing you notice and smile at, which stops being true the moment
 * there is always one on screen.
 */

const maxPets = 2

let nextId = 0

function randomBetween([min, max]: readonly [number, number]): number {
  return min + Math.random() * (max - min)
}

function pickSpecies(): PetSpecies {
  return petSpecies[Math.floor(Math.random() * petSpecies.length)]
}

export function PetLayer() {
  const reduceMotion = usePrefersReducedMotion()
  const { play } = useSound()
  const [pets, setPets] = useState<PetInstance[]>([])
  const [trackWidth, setTrackWidth] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const countRef = useRef(0)

  // The track's width decides where a pet enters and how far it has to walk.
  useEffect(() => {
    const node = trackRef.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      setTrackWidth(entry.contentRect.width)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const release = useCallback(
    (species: PetSpecies | null) => {
      if (countRef.current >= maxPets) return
      const chosen = species ?? pickSpecies()
      const direction: 1 | -1 = Math.random() < 0.5 ? 1 : -1
      const width = trackRef.current?.getBoundingClientRect().width ?? 0
      const box = petShapes[chosen].size * 1.3
      countRef.current++
      setPets((current) => [
        ...current,
        {
          id: nextId++,
          species: chosen,
          direction,
          // Enter just off whichever edge it is walking away from.
          startX: direction === 1 ? -box * 1.5 : width + box * 0.5,
        },
      ])
      play('creature')
    },
    [play],
  )

  const retire = useCallback((id: number) => {
    countRef.current = Math.max(0, countRef.current - 1)
    setPets((current) => current.filter((pet) => pet.id !== id))
  }, [])

  const onPoke = useCallback(() => play('creature'), [play])

  // The ambient schedule. Each release arms the next one.
  useEffect(() => {
    if (reduceMotion) return
    let timer = 0
    const schedule = (delayMs: number) => {
      timer = window.setTimeout(() => {
        release(null)
        schedule(randomBetween(petSchedule.intervalMs))
      }, delayMs)
    }
    schedule(randomBetween(petSchedule.firstMs))
    return () => window.clearTimeout(timer)
  }, [reduceMotion, release])

  // Terminal summons skip the schedule but still respect the cap.
  useEffect(() => onSummonPet(release), [release])

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      // Tall enough for the largest pet, and clipped: they enter from beyond
      // both edges, and unclipped that overflow would give the whole document
      // a horizontal scrollbar.
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-80 overflow-hidden"
    >
      {pets.map((pet) => (
        <Pet key={pet.id} instance={pet} trackWidth={trackWidth} onDone={retire} onPoke={onPoke} />
      ))}
    </div>
  )
}
