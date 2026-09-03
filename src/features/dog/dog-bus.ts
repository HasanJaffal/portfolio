/**
 * A one-event bus so the terminal can talk to the dog.
 *
 * The command registry is a plain module with no route into React state, and
 * the dog is a leaf of the workspace tree. Rather than thread a callback down
 * through two providers for the sake of one novelty command, each side keeps a
 * single import of this file.
 */

export type DogCommand =
  /** Trot over to the middle of the floor. */
  | 'come'
  | 'sit'
  /** Get back up and go about her business. */
  | 'stay'
  | 'speak'
  /** A short excited dash, then back to idling. */
  | 'fetch'
  | 'sleep'

export const dogCommands: readonly DogCommand[] = ['come', 'sit', 'stay', 'speak', 'fetch', 'sleep']

export function isDogCommand(value: string): value is DogCommand {
  return (dogCommands as readonly string[]).includes(value)
}

type CommandHandler = (command: DogCommand) => void

const handlers = new Set<CommandHandler>()

export function onDogCommand(handler: CommandHandler): () => void {
  handlers.add(handler)
  return () => {
    handlers.delete(handler)
  }
}

export function tellDog(command: DogCommand): void {
  // Copy first: a handler may unsubscribe itself while we iterate.
  for (const handler of [...handlers]) handler(command)
}
