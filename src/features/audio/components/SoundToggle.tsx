import { motion } from 'motion/react'
import { Volume2, VolumeX } from 'lucide-react'
import { useSound } from '@/features/audio/audio-context'
import { Tooltip } from '@/components/ui/tooltip'
import { transitions } from '@/lib/motion'

/** Global mute switch. The preference is persisted across visits. */
export function SoundToggle() {
  const { muted, toggleMuted } = useSound()
  const Icon = muted ? VolumeX : Volume2

  return (
    <Tooltip content={muted ? 'Unmute interface (sound off)' : 'Mute interface (sound on)'}>
      <button
        type="button"
        onClick={toggleMuted}
        aria-label={muted ? 'Unmute interface sounds' : 'Mute interface sounds'}
        aria-pressed={!muted}
        className="rounded-sm p-1.5 text-muted transition-colors duration-150 hover:bg-panel-hover hover:text-lime"
      >
        <motion.span
          key={muted ? 'muted' : 'live'}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transitions.fast}
          className="block"
        >
          <Icon className={muted ? 'h-4 w-4' : 'h-4 w-4 text-lime/80'} />
        </motion.span>
      </button>
    </Tooltip>
  )
}
