import { soundSpecs, type SoundName, type Voice } from '@/features/audio/data'

/**
 * A tiny WebAudio synthesiser for the interface.
 *
 * Three rules shape the design:
 *
 * 1. **Nothing is created before the browser allows it.** The `AudioContext`
 *    is built inside `unlock()`, which the provider only calls from a real
 *    user gesture. `play()` before that is a silent no-op rather than a
 *    console warning and a suspended context.
 * 2. **Overlap can never turn into noise.** Plays are throttled per sound,
 *    the total number of simultaneous voices is capped, and everything runs
 *    through a compressor before the destination.
 * 3. **Failure is never fatal.** Blocked or unsupported audio degrades to
 *    silence; no call site has to care.
 */

/** Above this many simultaneous oscillators, new plays are dropped. */
const maxConcurrentVoices = 10
/** Master trim. The compressor below catches anything that stacks up. */
const masterGain = 0.9
const noiseBufferSeconds = 0.4

export interface AudioEngine {
  /** Build the context. Safe to call repeatedly; only the first call works. */
  unlock(): void
  play(name: SoundName): void
  setMuted(muted: boolean): void
  /** Release the context. The engine stays usable — it rebuilds on unlock. */
  dispose(): void
}

type AudioContextConstructor = typeof AudioContext

function getAudioContextCtor(): AudioContextConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as typeof window & { webkitAudioContext?: AudioContextConstructor }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

/** One buffer of white noise, reused by every noise voice for the session. */
function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * noiseBufferSeconds)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function detune(freq: number, cents: number | undefined): number {
  if (!cents) return freq
  return freq * Math.pow(2, ((Math.random() * 2 - 1) * cents) / 1200)
}

export function createAudioEngine(): AudioEngine {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let noiseBuffer: AudioBuffer | null = null
  let muted = false
  let activeVoices = 0
  const lastPlayedAt = new Map<SoundName, number>()

  function unlock(): void {
    if (ctx) {
      // A context can be suspended again by the browser (tab backgrounded,
      // policy change); a later gesture should bring it back.
      if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
      return
    }
    const Ctor = getAudioContextCtor()
    if (!Ctor) return
    try {
      ctx = new Ctor()
      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -10
      compressor.ratio.value = 8
      compressor.attack.value = 0.003
      compressor.release.value = 0.15
      master = ctx.createGain()
      master.gain.value = muted ? 0 : masterGain
      master.connect(compressor)
      compressor.connect(ctx.destination)
      noiseBuffer = createNoiseBuffer(ctx)
      if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
    } catch {
      ctx = null
      master = null
    }
  }

  /** Schedules a single voice and wires it to release itself when it ends. */
  function scheduleVoice(voice: Voice, startAt: number): void {
    if (!ctx || !master) return

    const at = startAt + (voice.delayMs ?? 0) / 1000
    const attack = voice.attackMs / 1000
    const decay = voice.decayMs / 1000
    const gain = ctx.createGain()

    // Exponential ramps can't reach zero, so shape the tail with
    // setTargetAtTime and stop the source once it is inaudible.
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.linearRampToValueAtTime(voice.gain, at + attack)
    // Hold flat for the first third, then fall away. A chip note sustains at
    // level and cuts; an immediate decay sounds like a plucked string.
    gain.gain.setValueAtTime(voice.gain, at + attack + decay * 0.33)
    gain.gain.setTargetAtTime(0.0001, at + attack + decay * 0.33, Math.max(decay / 5, 0.004))
    gain.connect(master)

    let source: AudioScheduledSourceNode
    if (voice.type === 'noise') {
      if (!noiseBuffer) return
      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuffer
      noise.loop = true
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = voice.cutoff ?? 3000
      noise.connect(filter)
      filter.connect(gain)
      source = noise
    } else {
      const osc = ctx.createOscillator()
      osc.type = voice.type
      const cents = voice.jitterCents
      const from = detune(voice.freq, cents)
      osc.frequency.setValueAtTime(from, at)

      if (voice.freqEnd !== undefined) {
        const to = Math.max(detune(voice.freqEnd, cents), 1)
        const sweep = attack + decay
        if (voice.steps && voice.steps > 1) {
          // Hold each pitch, then jump. No ramp — the audible staircase is
          // the point, and it is what makes this read as a console chip
          // rather than a synthesiser sliding between two notes.
          const ratio = to / from
          for (let i = 1; i < voice.steps; i++) {
            const progress = i / (voice.steps - 1)
            osc.frequency.setValueAtTime(from * Math.pow(ratio, progress), at + sweep * (i / voice.steps))
          }
        } else {
          osc.frequency.exponentialRampToValueAtTime(to, at + sweep)
        }
      }

      osc.connect(gain)
      source = osc
    }

    const stopAt = at + attack + decay + 0.06
    activeVoices++
    source.onended = () => {
      activeVoices--
      source.disconnect()
      gain.disconnect()
    }
    source.start(at)
    source.stop(stopAt)
  }

  function play(name: SoundName): void {
    if (muted || !ctx || !master) return
    if (ctx.state !== 'running') {
      // Autoplay policy still holding the context. Try once, stay silent.
      void ctx.resume().catch(() => {})
      return
    }

    const spec = soundSpecs[name]
    const now = ctx.currentTime
    const last = lastPlayedAt.get(name)
    if (last !== undefined && (now - last) * 1000 < spec.throttleMs) return
    if (activeVoices + spec.voices.length > maxConcurrentVoices) return

    lastPlayedAt.set(name, now)
    for (const voice of spec.voices) scheduleVoice(voice, now)
  }

  function setMuted(next: boolean): void {
    muted = next
    if (master && ctx) {
      // Ramp rather than jump, so muting mid-sound doesn't click.
      master.gain.setTargetAtTime(next ? 0 : masterGain, ctx.currentTime, 0.015)
    }
  }

  function dispose(): void {
    const closing = ctx
    ctx = null
    master = null
    noiseBuffer = null
    activeVoices = 0
    lastPlayedAt.clear()
    void closing?.close().catch(() => {})
  }

  return { unlock, play, setMuted, dispose }
}
