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
 * 2. **Nothing is scheduled before the clock is real.** See below — this is
 *    the whole reason the first few seconds of a session used to be silent.
 * 3. **Overlap can never turn into noise.** Plays are throttled per sound,
 *    the total number of simultaneous voices is capped, and everything runs
 *    through a compressor before the destination.
 * 4. **Failure is never fatal.** Blocked or unsupported audio degrades to
 *    silence; no call site has to care.
 *
 * ## The cold-start window
 *
 * A fresh `AudioContext` reports `state: 'running'` the instant it is built,
 * and it is lying by omission: constructing a context does not open the output
 * device, and until something has actually asked the graph to render, its
 * `currentTime` sits at exactly `0`. On a warm machine that lasts a couple of
 * hundred milliseconds. On a cold one — a sleeping endpoint, Bluetooth, an
 * exclusive-mode driver — it is seconds.
 *
 * Anything scheduled during that window is scheduled against `currentTime`,
 * which is to say at zero: the envelope is written into the very first block
 * of samples, which is the block the output stream throws away while it opens.
 * The sound is not delayed, it is *gone*, and it stays gone for as long as the
 * device takes to wake — which is exactly what "the audio doesn't work for the
 * first few seconds" is.
 *
 * So two things happen here. `unlock()` starts a silent one-sample source, and
 * that — not the visitor's first click — is what pays for the device opening.
 * And `play()` refuses to schedule anything until `currentTime` has actually
 * moved, holding the most recent request instead and firing it once the clock
 * is real. After that every voice is scheduled a hair *ahead* of `currentTime`
 * rather than exactly on it, so a slow frame can never push an envelope into
 * the past again.
 */

/** Above this many simultaneous oscillators, new plays are dropped. */
const maxConcurrentVoices = 10
/** Master trim. The compressor below catches anything that stacks up. */
const masterGain = 0.9
const noiseBufferSeconds = 0.4
/**
 * Every voice is scheduled this far ahead of `currentTime`. Well under the
 * threshold where a UI sound stops feeling attached to the click that caused
 * it, and enough that a long frame between reading the clock and handing the
 * graph its envelope can't leave the two ends of a ramp on the wrong side of
 * "now".
 */
const lookahead = 0.015
/** How often to check whether the output device has finished opening. */
const clockPollMs = 25
/**
 * Give up waiting for the clock after this and schedule regardless. A context
 * that never renders is either broken or on a browser whose `currentTime` we
 * have misread, and being silent forever is the worse failure of the two.
 */
const clockTimeoutMs = 8000
/**
 * A sound asked for during the cold-start window still plays if the wait came
 * in under this. Longer than that and the click it belonged to is ancient
 * history — a blip arriving on its own reads as a glitch, not as feedback.
 */
const replayWindowMs = 1000

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

  /** False until `currentTime` has moved — see "the cold-start window" above. */
  let clockLive = false
  let clockTimer: number | null = null
  let clockWaitFrom = 0
  /** The one sound held over the cold start. Only the newest is worth keeping. */
  let held: SoundName | null = null
  let heldAt = 0

  /**
   * Starts a silent one-sample source, which is the cheapest way to make the
   * graph render and so the cheapest way to make the browser open the output
   * device. Doing it on the unlocking gesture means the device spends its
   * wake-up time *then*, rather than eating whatever the visitor does next.
   */
  function primeOutput(): void {
    if (!ctx) return
    try {
      const source = ctx.createBufferSource()
      source.buffer = ctx.createBuffer(1, 1, ctx.sampleRate)
      source.connect(ctx.destination)
      source.start()
    } catch {
      // A context that won't even take a silent buffer isn't going to make
      // any noise either. The clock wait below gives up on its own.
    }
  }

  /** Polls until the device is genuinely rendering, then releases anything held. */
  function waitForClock(): void {
    if (clockLive || clockTimer !== null || !ctx) return
    clockWaitFrom = performance.now()

    const check = () => {
      clockTimer = null
      if (!ctx) return
      // `state` alone is not the test: it reads 'running' from the moment the
      // context is constructed. A `currentTime` that has left zero is the only
      // honest signal that samples are reaching the device.
      const started = ctx.state === 'running' && ctx.currentTime > 0
      if (!started && performance.now() - clockWaitFrom < clockTimeoutMs) {
        clockTimer = window.setTimeout(check, clockPollMs)
        return
      }
      clockLive = true
      const name = held
      held = null
      if (started && name && performance.now() - heldAt < replayWindowMs) play(name)
    }

    clockTimer = window.setTimeout(check, clockPollMs)
  }

  function unlock(): void {
    if (ctx) {
      // A context can be suspended again by the browser (tab backgrounded,
      // policy change); a later gesture should bring it back — and the device
      // has to open all over again after it does.
      if (ctx.state === 'suspended') {
        clockLive = false
        void ctx.resume().then(primeOutput).catch(() => {})
        waitForClock()
      }
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
      primeOutput()
      waitForClock()
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
      // Autoplay policy still holding the context. Try once, and hold the
      // sound below in case the resume lands in time to be worth playing.
      void ctx.resume().catch(() => {})
    }

    if (!clockLive) {
      // The output device is still opening, and anything scheduled now would
      // be written into samples it is going to discard. Keep the request —
      // just the newest, so a burst can't come back as a burst — and let
      // `waitForClock` decide whether it is still worth hearing.
      held = name
      heldAt = performance.now()
      waitForClock()
      return
    }

    const spec = soundSpecs[name]
    const now = ctx.currentTime + lookahead
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
    if (clockTimer !== null) window.clearTimeout(clockTimer)
    clockTimer = null
    clockLive = false
    held = null
    void closing?.close().catch(() => {})
  }

  return { unlock, play, setMuted, dispose }
}
