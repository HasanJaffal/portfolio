import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { useAnimationFrame } from 'motion/react'
import { onDogCommand, type DogCommand } from '@/features/dog/dog-bus'
import { canvas, createPose, type DogPose } from '@/features/dog/model'
import { readPointer, takeSwipe, watchPointer } from '@/features/dog/pointer'
import { createHeadProbe, drawDog, resolvePalette, type HeadProbe } from '@/features/dog/renderer'

/**
 * Everything that makes the dog feel alive.
 *
 * The model is a couple of dozen boxes; all of the character comes from here.
 * The loop runs on one `requestAnimationFrame`, composes a pose, and rasterises
 * it — no React state, no re-renders, and one rect read taken at the top of
 * each frame before anything has been written, so it never forces a synchronous
 * reflow.
 *
 * The rule throughout: nothing snaps. Gaze is a spring, attention and
 * excitement are ramps, and turning around is a genuine yaw that eases through
 * front-on. A value that jumps reads as a state machine; a value that eases
 * reads as an animal deciding something.
 *
 * Two things here are worth knowing before changing anything. Her yaw only ever
 * moves *within* `[−π, 0]` and never wraps, so both directions of turn pass
 * through facing the viewer — that constraint is the entire reason a turn reads
 * as a pivot rather than as a mirror flip. And she will not advance along the
 * floor until the turn is nearly finished, because a dog sliding sideways
 * mid-turn gives the whole thing away in one frame.
 */

/* ---- tuning ---------------------------------------------------------- */

const tuning = {
  /** Trot speed, px/s. */
  walkSpeed: 66,
  /** She notices the cursor inside this radius and loses interest outside it. */
  noticeRadius: 300,
  /** Inside this, she is delighted. */
  closeRadius: 130,
  /** The cursor has to be at least this far off before chasing it is worth a walk. */
  chaseThreshold: 170,
  /** Seconds without a cursor or a click before she settles down to sleep. */
  sleepAfter: 55,
  /** Gaze spring. Deliberately under-damped, so a fast flick overshoots and settles. */
  gazeStiffness: 155,
  gazeDamping: 20,
  blinkGap: [2.4, 6.5],
  blinkDuration: 0.12,
  glanceGap: [1.3, 3.6],
  actionGap: [3.5, 9],
  hopDuration: 0.42,
  /** Model units. Roughly a quarter of her standing height. */
  hopHeight: 3.6,
  /** CSS px of travel per full four-beat gait cycle. */
  strideLength: 46,
  /** How fast a turn eases. Slow enough that front-on is clearly a pose. */
  turnRate: 3.2,
  /** She will not walk while the turn still has this much left to go. */
  turnGate: 0.35,
  /** Rear-up ceiling, radians — 22°, which is as far as the buffer allows. */
  rearMax: 0.38,
  /** Inside this many px of her head, the grab is at full strength. */
  grabRadius: 95,
  /** And it fades to nothing this much further out again. */
  grabFalloff: 120,
  /** Close enough to actually connect: a snap, a hop and a bark. */
  snapRadius: 55,
  /** Lingering this close but out of reach is worth walking over for. */
  approachRadius: 240,
  /** How near her head a flick has to pass before she takes it personally. */
  swipeRadius: 150,
  /** A swipe sends her this far after it, per px/s of release speed. */
  swipeChase: 0.34,
  /** …up to this much, so a violent flick doesn't fling her across the floor. */
  swipeChaseMax: 300,
} as const

type Posture = 'idle' | 'walk' | 'sit' | 'sleep'

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value
}

/** Frame-rate independent approach. `rate` is roughly "how much per second". */
function approach(current: number, target: number, rate: number, dt: number): number {
  return current + (target - current) * clamp(rate * dt, 0, 1)
}

function between(range: readonly [number, number]): number {
  return range[0] + Math.random() * (range[1] - range[0])
}

/**
 * Distance from a point to a line *segment*. A swipe is a path, not a
 * destination: a finger flicked straight across her ends up well past her, and
 * measuring only the endpoints would miss the one gesture most obviously aimed
 * at her.
 */
function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const abx = bx - ax
  const aby = by - ay
  const lengthSq = abx * abx + aby * aby
  const t = lengthSq === 0 ? 0 : clamp(((px - ax) * abx + (py - ay) * aby) / lengthSq, 0, 1)
  return Math.hypot(px - (ax + abx * t), py - (ay + aby * t))
}

interface Mind {
  elapsed: number
  posture: Posture
  postureFor: number
  /** Position along the floor, px from the track's left edge. */
  x: number
  targetX: number
  /** Body yaw, eased. Always inside `[−π, 0]`. */
  yaw: number
  /** Either `0` (facing screen-right) or `−π` (facing screen-left). */
  yawTarget: number
  /** Signed rad/s from the last frame, which is what she banks into. */
  yawRate: number
  roll: number
  /** How far through the four-beat gait she is, in radians. */
  gaitPhase: number
  nextActionAt: number
  chaseReadyAt: number
  barkReadyAt: number
  sitUntil: number

  gazeX: number
  gazeY: number
  lookX: number
  lookY: number
  lookVX: number
  lookVY: number
  nextGlanceAt: number

  blink: number
  blinkUntil: number
  nextBlinkAt: number
  blinksQueued: number

  attention: number
  excitement: number
  sitAmount: number
  earTwitch: number
  nextTwitchAt: number

  /** 0..1: how hard she is trying to get her paws on the cursor. */
  reach: number
  snapAt: number
  lungeAt: number
  approachAt: number

  hopAt: number
  lastStimulusAt: number
  queued: DogCommand | null
  seeded: boolean

  pose: DogPose
  head: HeadProbe
  palette: Uint32Array | null
  ctx: CanvasRenderingContext2D | null
  image: ImageData | null
  pixels: Uint32Array | null
}

function createMind(): Mind {
  return {
    elapsed: 0,
    posture: 'idle',
    postureFor: 0,
    x: 0,
    targetX: 0,
    yaw: -Math.PI,
    yawTarget: -Math.PI,
    yawRate: 0,
    roll: 0,
    gaitPhase: 0,
    nextActionAt: 4,
    chaseReadyAt: 6,
    barkReadyAt: 0,
    sitUntil: 0,
    gazeX: 0,
    gazeY: 0,
    lookX: 0,
    lookY: 0,
    lookVX: 0,
    lookVY: 0,
    nextGlanceAt: 1,
    blink: 0,
    blinkUntil: 0,
    nextBlinkAt: 2,
    blinksQueued: 0,
    attention: 0,
    excitement: 0,
    sitAmount: 0,
    earTwitch: 0,
    nextTwitchAt: 3,
    reach: 0,
    snapAt: 0,
    lungeAt: -Infinity,
    approachAt: 0,
    hopAt: -Infinity,
    lastStimulusAt: 0,
    queued: null,
    seeded: false,
    pose: createPose(),
    head: createHeadProbe(),
    palette: null,
    ctx: null,
    image: null,
    pixels: null,
  }
}

/**
 * The refs arrive from the component that renders them rather than being
 * created here: React's compiler is strict about who may hold a ref, and it is
 * right — the elements belong to the markup, and this hook only borrows.
 */
export interface DogBrainOptions {
  /** The strip she walks along. Measured every frame, so resizing is free. */
  trackRef: RefObject<HTMLDivElement | null>
  /** Moved along the floor; the only thing written outside the pixel buffer. */
  root: RefObject<HTMLDivElement | null>
  /** The low-resolution buffer she is rasterised into. */
  surface: RefObject<HTMLCanvasElement | null>
  /** False while the boot overlay is up, or when the feature is parked. */
  active: boolean
  /** No wandering, no hops, no grabbing, and everything else at a fraction. */
  reduceMotion: boolean
  onBark: () => void
}

export interface DogBrainControls {
  /** A click, a tap, or Enter on the focused sprite. */
  poke: () => void
}

export function useDogBrain({
  trackRef,
  root,
  surface,
  active,
  reduceMotion,
  onBark,
}: DogBrainOptions): DogBrainControls {
  const mind = useRef<Mind>(createMind())
  const onBarkRef = useRef(onBark)

  useEffect(() => {
    onBarkRef.current = onBark
  }, [onBark])

  const bark = useCallback((force = false) => {
    const m = mind.current
    if (!force && m.elapsed < m.barkReadyAt) return
    m.barkReadyAt = m.elapsed + 2.4
    m.excitement = Math.min(1, m.excitement + 0.75)
    m.earTwitch = 1
    m.hopAt = m.elapsed
    m.lastStimulusAt = m.elapsed
    if (m.posture === 'sleep') m.posture = 'idle'
    onBarkRef.current()
  }, [])

  const poke = useCallback(() => {
    const m = mind.current
    m.lastStimulusAt = m.elapsed
    m.attention = 1
    bark(true)
  }, [bark])

  useEffect(() => watchPointer(), [])

  useEffect(
    () =>
      onDogCommand((command) => {
        mind.current.queued = command
        mind.current.lastStimulusAt = mind.current.elapsed
      }),
    [],
  )

  useAnimationFrame((_time, deltaMs) => {
    const m = mind.current
    const track = trackRef.current
    const rootNode = root.current
    const surfaceNode = surface.current
    if (!active || !track || !rootNode || !surfaceNode) return

    // A backgrounded tab hands back one enormous delta on return; clamp it so
    // she neither teleports across the floor nor shakes herself apart.
    const dt = Math.min(deltaMs, 50) / 1000
    m.elapsed += dt
    m.postureFor += dt

    const rect = track.getBoundingClientRect()
    if (rect.width === 0) return

    if (!m.ctx) {
      const ctx = surfaceNode.getContext('2d')
      if (!ctx) return
      const image = ctx.createImageData(canvas.bufWidth, canvas.bufHeight)
      m.ctx = ctx
      m.image = image
      m.pixels = new Uint32Array(image.data.buffer)
      m.palette = resolvePalette(surfaceNode.parentElement ?? document.body)
    }
    const ctx = m.ctx
    const image = m.image
    const pixels = m.pixels
    const palette = m.palette
    if (!image || !pixels || !palette) return

    const maxX = Math.max(0, rect.width - canvas.width)

    if (!m.seeded) {
      m.x = clamp(rect.width * 0.62, 0, maxX)
      m.targetX = m.x
      m.lastStimulusAt = m.elapsed
      m.seeded = true
    }
    m.x = clamp(m.x, 0, maxX)

    /* ---- where is the cursor, relative to her face? ------------------- */

    // Her head is wherever the last frame put it, projected through the same
    // transform that drew her. A fixed anchor would be a lie the moment she
    // reared up or turned to face the camera — which is exactly when it matters.
    const pointer = readPointer()
    const headX = rect.left + m.x + m.head.x * canvas.scale
    const headY = rect.bottom - canvas.float - canvas.height + m.head.y * canvas.scale
    // `seen` already encodes the difference between the two input styles: a
    // mouse stays live where it stopped, a finger only for as long as it is
    // down. So this is one test for both, and touch gets the whole repertoire
    // — the gaze, the rear-up, the swipe at her — rather than taps alone.
    const pointerFresh = pointer.seen && performance.now() - pointer.movedAt < 2400
    const dx = pointer.x - headX
    const dy = pointer.y - headY
    const dist = Math.hypot(dx, dy) || 1

    if (pointerFresh && dist < tuning.noticeRadius) m.lastStimulusAt = m.elapsed

    // Attention climbs fast and fades slowly, which is what "noticing" feels
    // like — the head comes up at once and goes back down reluctantly.
    const wants = pointerFresh ? clamp(1 - (dist - tuning.closeRadius) / tuning.noticeRadius, 0, 1) : 0
    m.attention = approach(m.attention, wants, wants > m.attention ? 5 : 1.1, dt)
    m.excitement = approach(m.excitement, pointerFresh && dist < tuning.closeRadius ? 0.85 : 0, 1, dt)

    /* ---- gaze ---------------------------------------------------------- */

    const sleeping = m.posture === 'sleep'

    if (pointerFresh && !sleeping) {
      m.gazeX = dx / dist
      m.gazeY = clamp(dy / dist, -1, 0.85)
    } else if (m.elapsed > m.nextGlanceAt) {
      // Nothing to watch, so she finds something. About a third of the glances
      // come back to centre, which stops it reading as a mechanical scan.
      const recentre = Math.random() < 0.34
      m.gazeX = recentre ? 0 : (Math.random() * 2 - 1) * 0.95
      m.gazeY = recentre ? 0 : Math.random() * 1.1 - 0.65
      m.nextGlanceAt = m.elapsed + between(tuning.glanceGap)
    }

    // A hair of drift on top of the target. Real eyes never hold perfectly
    // still, and a pupil frozen between glances is what kills the illusion.
    const driftX = Math.sin(m.elapsed * 1.9) * 0.035 + Math.sin(m.elapsed * 4.3) * 0.015
    const driftY = Math.cos(m.elapsed * 1.4) * 0.03
    const gazeScale = sleeping ? 0.12 : 1

    const pullX = ((m.gazeX + driftX) * gazeScale - m.lookX) * tuning.gazeStiffness
    const pullY = ((m.gazeY + driftY) * gazeScale - m.lookY) * tuning.gazeStiffness
    m.lookVX += (pullX - m.lookVX * tuning.gazeDamping) * dt
    m.lookVY += (pullY - m.lookVY * tuning.gazeDamping) * dt
    m.lookX = clamp(m.lookX + m.lookVX * dt, -1.25, 1.25)
    m.lookY = clamp(m.lookY + m.lookVY * dt, -1.25, 1.25)

    /* ---- blinking ------------------------------------------------------ */

    if (m.elapsed > m.nextBlinkAt && m.blinksQueued === 0) {
      // Every so often a double blink. It is a very small thing and it is most
      // of the difference between a puppet and something with a nervous system.
      m.blinksQueued = Math.random() < 0.22 ? 2 : 1
      m.nextBlinkAt = m.elapsed + between(tuning.blinkGap) * (reduceMotion ? 1.8 : 1)
    }
    if (m.blinksQueued > 0 && m.elapsed > m.blinkUntil) {
      m.blinkUntil = m.elapsed + tuning.blinkDuration
      m.blinksQueued--
    }
    const blinkPhase = clamp((m.blinkUntil - m.elapsed) / tuning.blinkDuration, 0, 1)
    m.blink = Math.sin(blinkPhase * Math.PI)

    /* ---- the grab ------------------------------------------------------ */

    // The headline interaction: a cursor held near her face is something she
    // will stand up and swipe at, not just something she notices.
    const grabbing = !reduceMotion && !sleeping && pointerFresh
    const reachTarget = grabbing
      ? dist < tuning.grabRadius
        ? 1
        : clamp(1 - (dist - tuning.grabRadius) / tuning.grabFalloff, 0, 1)
      : 0
    m.reach = approach(m.reach, reachTarget, reachTarget > m.reach ? 3.5 : 2.2, dt)

    // She only comes up on her hind legs for something held *above* her. A
    // cursor level with her feet gets a paw at most.
    const rear = m.reach * tuning.rearMax * clamp(-dy / 90, 0, 1)

    if (grabbing && m.reach > 0.85 && dist < tuning.snapRadius && m.elapsed > m.snapAt) {
      m.snapAt = m.elapsed + 1.6
      m.lungeAt = m.elapsed
      bark(true)
    }

    /* ---- what is she doing? -------------------------------------------- */

    const setPosture = (next: Posture) => {
      if (m.posture === next) return
      m.posture = next
      m.postureFor = 0
      if (next === 'sit') m.sitUntil = m.elapsed + 4 + Math.random() * 4
    }

    const walkTo = (target: number) => {
      m.targetX = clamp(target, 0, maxX)
      if (Math.abs(m.targetX - m.x) > 4) setPosture('walk')
    }

    const command = m.queued
    m.queued = null
    if (command === 'come') walkTo(rect.width * 0.5 - canvas.width / 2)
    else if (command === 'sit') setPosture('sit')
    else if (command === 'stay') setPosture('idle')
    else if (command === 'speak') bark(true)
    else if (command === 'sleep') setPosture('sleep')
    else if (command === 'fetch') {
      m.excitement = 1
      walkTo(m.x < maxX / 2 ? maxX : 0)
    }

    /* ---- swipes -------------------------------------------------------- */

    // A flick past her nose is the touchscreen's version of waving something
    // in a dog's face, so she takes off after it: a bark, a lunge, and a dash
    // the way it went, scaled by how hard it was thrown. Anything that passed
    // nowhere near her was aimed at the page, and she ignores it.
    const swipe = takeSwipe()
    if (
      swipe &&
      distanceToSegment(headX, headY, swipe.originX, swipe.originY, swipe.x, swipe.y) <
        tuning.swipeRadius
    ) {
      m.lastStimulusAt = m.elapsed
      m.attention = 1
      m.excitement = 1
      m.lungeAt = m.elapsed
      // Rate-limited rather than forced, unlike a poke: the lunge and the dash
      // are feedback enough on their own, and a run of flicks across her
      // shouldn't turn into a machine-gun of barks.
      bark()
      if (!reduceMotion) {
        walkTo(
          m.x + clamp(swipe.vx * tuning.swipeChase, -tuning.swipeChaseMax, tuning.swipeChaseMax),
        )
        // She just chased something down; the ambient cursor-chase would only
        // send her straight back the other way.
        m.chaseReadyAt = m.elapsed + 5
        m.approachAt = m.elapsed + 2
      }
    }

    if (!sleeping && m.elapsed - m.lastStimulusAt > tuning.sleepAfter) setPosture('sleep')
    if (sleeping && m.elapsed - m.lastStimulusAt < 0.3) {
      setPosture('idle')
      m.nextActionAt = m.elapsed + 1.5
      m.earTwitch = 1
    }

    /* ---- turning ------------------------------------------------------- */

    if (m.posture === 'walk') {
      m.yawTarget = m.targetX > m.x ? 0 : -Math.PI
    } else if (!sleeping && m.reach > 0.25) {
      m.yawTarget = dx > 0 ? 0 : -Math.PI
    } else if (!sleeping && m.attention > 0.5 && Math.abs(dx) > 30) {
      m.yawTarget = dx > 0 ? 0 : -Math.PI
    }

    // Eased *within* [−π, 0], never wrapping, so a turn always sweeps through
    // −π/2 and she visibly pivots through front-on. The extra hard cap keeps a
    // single long frame from stepping far enough to read as a jump.
    const eased = approach(m.yaw, m.yawTarget, tuning.turnRate, dt)
    const before = m.yaw
    m.yaw += clamp(eased - m.yaw, -0.3, 0.3)
    m.yawRate = dt > 0 ? (m.yaw - before) / dt : 0
    const turning = Math.abs(m.yaw - m.yawTarget) > tuning.turnGate

    // She banks into it, the way anything with mass does.
    m.roll = approach(m.roll, clamp(-m.yawRate * 0.06, -0.15, 0.15), 9, dt)

    if (m.posture === 'walk') {
      const gap = m.targetX - m.x
      const step = tuning.walkSpeed * (1 + m.excitement * 0.5) * dt
      if (turning) {
        // Turn first, then walk. Sliding sideways through a pivot is the one
        // thing that would give the whole illusion away.
        m.gaitPhase += Math.abs(m.yawRate) * dt * 0.9
      } else if (Math.abs(gap) <= step) {
        m.x = m.targetX
        setPosture('idle')
        m.nextActionAt = m.elapsed + between(tuning.actionGap)
      } else {
        m.x += step * (gap > 0 ? 1 : -1)
        m.gaitPhase += (step / tuning.strideLength) * Math.PI * 2
      }
    } else if (m.posture === 'idle' && !reduceMotion && m.elapsed > m.nextActionAt) {
      const roll = Math.random()
      if (roll < 0.55) walkTo(Math.random() * maxX)
      else if (roll < 0.85) setPosture('sit')
      else bark()
      m.nextActionAt = m.elapsed + between(tuning.actionGap)
    } else if (m.posture === 'sit' && m.elapsed > m.sitUntil) {
      setPosture('idle')
      m.nextActionAt = m.elapsed + between(tuning.actionGap) * 0.5
    } else {
      m.gaitPhase += Math.abs(m.yawRate) * dt * 0.9
    }

    // Interested enough to come over. Rate-limited hard, on purpose: a dog
    // that trails your cursor everywhere stops being charming inside a minute.
    if (
      !reduceMotion &&
      pointerFresh &&
      m.posture !== 'walk' &&
      m.attention > 0.75 &&
      m.elapsed > m.chaseReadyAt &&
      Math.abs(dx) > tuning.chaseThreshold
    ) {
      walkTo(m.x + dx - Math.sign(dx) * 60)
      m.chaseReadyAt = m.elapsed + 14
    }

    // Close enough to be worth going for, though. This cooldown is far shorter
    // than the general chase above, because getting her paws on the cursor is
    // the thing she is for.
    if (
      grabbing &&
      m.posture !== 'walk' &&
      m.reach < 0.6 &&
      dist < tuning.approachRadius &&
      Math.abs(dx) > 70 &&
      m.elapsed > m.approachAt
    ) {
      walkTo(m.x + dx)
      m.approachAt = m.elapsed + 3
    }

    if (m.elapsed > m.nextTwitchAt) {
      m.earTwitch = 1
      m.nextTwitchAt = m.elapsed + 2.5 + Math.random() * 6
    }
    m.earTwitch = approach(m.earTwitch, 0, 4.5, dt)

    m.sitAmount = approach(m.sitAmount, m.posture === 'sit' || m.posture === 'sleep' ? 1 : 0, 6, dt)

    /* ---- pose ---------------------------------------------------------- */

    const damp = reduceMotion ? 0.3 : 1
    const walking = m.posture === 'walk' && !turning
    const asleep = m.posture === 'sleep'
    const pose = m.pose

    const hopAge = m.elapsed - m.hopAt
    const hop =
      !reduceMotion && hopAge >= 0 && hopAge < tuning.hopDuration
        ? Math.sin((hopAge / tuning.hopDuration) * Math.PI) * tuning.hopHeight
        : 0

    const bob = walking
      ? Math.abs(Math.sin(m.gaitPhase)) * 0.55
      : Math.sin(m.elapsed * (asleep ? 0.8 : 1.6)) * (asleep ? 0.5 : 0.32)

    const lungeAge = m.elapsed - m.lungeAt
    const lunge = lungeAge >= 0 && lungeAge < 0.35 ? Math.sin((lungeAge / 0.35) * Math.PI) * 2.6 : 0

    pose.yaw = m.yaw
    pose.roll = m.roll * damp
    // Rearing pushes her forward as well as up — partly because that is what
    // standing up does, and partly because it swings her tail back towards the
    // edge of the buffer and the shift buys it the room.
    pose.shift = rear * 8 + lunge
    pose.rear = rear
    pose.sit = m.sitAmount * 0.34
    pose.lift = (bob + hop) * damp
    pose.blink = Math.max(m.blink, asleep ? 0.94 : 0)
    pose.lookX = clamp(m.lookX, -1, 1)
    pose.lookY = clamp(m.lookY, -1, 1)

    // The head leads the eyes. `−acos` maps the horizontal gaze onto the same
    // [−π, 0] interval the body turns in, so a cursor directly above her puts
    // her face square to the camera, and the neck only makes up the difference.
    const gazeYaw = -Math.acos(clamp(m.lookX, -1, 1))
    pose.headYaw = clamp(gazeYaw - m.yaw, -0.85, 0.85) * (0.4 + 0.6 * m.attention) * damp
    pose.headPitch =
      (-pose.lookY * 0.42 + m.reach * 0.3 - m.sitAmount * 0.12 - (asleep ? 0.25 : 0)) * damp

    const perk = (0.05 + m.attention * 0.24 + m.earTwitch * 0.16 - (asleep ? 0.55 : 0)) * damp
    pose.earLeft = perk
    pose.earRight = perk * 0.88

    const wagSpeed = (5.5 + m.attention * 4 + m.excitement * 13 + m.reach * 6) * (asleep ? 0.25 : 1)
    const wagAmp = (0.12 + m.attention * 0.2 + m.excitement * 0.34) * damp * (asleep ? 0.3 : 1)
    pose.tailYaw = Math.sin(m.elapsed * wagSpeed) * wagAmp
    // Counter-rotated against the rear-up: without this her tail swings back
    // past the left edge of the buffer the moment she stands up.
    pose.tailLift = asleep ? -0.12 : clamp(0.12 + m.excitement * 0.2 + rear * 1.05, 0, 0.55)

    // A trot: diagonal pairs in step, which at four legs is the only gait that
    // reads at a glance.
    const swing = walking ? 0.45 : 0.05
    const beat = Math.sin(m.gaitPhase) * swing * damp
    const offBeat = -beat
    pose.legs[0] = beat
    pose.legs[1] = offBeat
    pose.legs[2] = offBeat
    pose.legs[3] = beat

    // Up on her hind legs, front paws swiping alternately at the cursor.
    if (m.reach > 0.001) {
      const swipe = Math.sin(m.elapsed * 9) * 0.35 * m.reach
      pose.legs[0] += m.reach * 0.9 + swipe
      pose.legs[1] += m.reach * 0.9 - swipe
    }
    // Sitting folds the hind legs right under her, which is also what stops the
    // rear-down pitch driving her back feet through the floor.
    pose.legs[2] += m.sitAmount * 1.2
    pose.legs[3] += m.sitAmount * 1.2

    /* ---- render -------------------------------------------------------- */

    rootNode.style.setProperty('transform', `translate3d(${m.x.toFixed(2)}px, 0, 0)`)
    drawDog(pixels, palette, pose, m.head)
    ctx.putImageData(image, 0, 0)

    if (import.meta.env.DEV) {
      // The MCP checks read pose values from here. Without it, a turn and a
      // rear-up can only be inferred from pixels.
      ;(window as unknown as Record<string, unknown>).__dog = { pose, mind: m }
    }
  })

  return { poke }
}
