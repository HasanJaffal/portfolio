import type { PetSpecies } from '@/features/pets/data'

/**
 * A one-event bus so the terminal can call a pet out.
 *
 * The command registry is a plain module, not a component, so it has no route
 * into React state. This keeps the connection to one import in each direction
 * instead of threading a callback through the terminal context.
 */

type SummonHandler = (species: PetSpecies | null) => void

const handlers = new Set<SummonHandler>()

export function onSummonPet(handler: SummonHandler): () => void {
  handlers.add(handler)
  return () => {
    handlers.delete(handler)
  }
}

export function summonPet(species: PetSpecies | null): void {
  // Copy first: a handler may unsubscribe itself while we iterate.
  for (const handler of [...handlers]) handler(species)
}
