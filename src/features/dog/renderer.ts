import {
  cameraPitch,
  canvas,
  ear,
  eye,
  flatMaterials,
  hipY,
  hips,
  legPaw,
  legShank,
  mat,
  materialCount,
  materialTokens,
  nose,
  pivots,
  projScale,
  shadeCount,
  skull,
  snout,
  tailTip,
  tailUpper,
  torso,
  type Box,
  type DogPose,
} from '@/features/dog/model'

/**
 * A very small software rasteriser: boxes in, pixels out.
 *
 * There is no WebGL here and there does not need to be. The whole dog is about
 * fourteen boxes; after back-face culling roughly forty quads survive, each
 * covering a bounding box of maybe ten by ten pixels, into a buffer of 2,496
 * pixels total. That is a few thousand point-in-quad tests a frame — less work
 * than the SVG version was handing the compositor, and it buys a solid that can
 * actually rotate.
 *
 * Pure, and deliberately free of React and of the DOM apart from one palette
 * read at startup. Nothing in here allocates per frame: the face pool, the
 * matrices and the sort order are all module-level and reused.
 */

/* ---- matrices --------------------------------------------------------- */

/**
 * Row-major 3x4 affine: `[r00 r01 r02 tx, r10 r11 r12 ty, r20 r21 r22 tz]`.
 * Every matrix here is a rotation plus a translation and never a scale, which
 * is why face normals can be read straight off the columns.
 */
type Mat = Float64Array

function mat4(): Mat {
  const m = new Float64Array(12)
  m[0] = 1
  m[5] = 1
  m[10] = 1
  return m
}

function setRotX(m: Mat, a: number): void {
  const c = Math.cos(a)
  const s = Math.sin(a)
  m[0] = 1
  m[1] = 0
  m[2] = 0
  m[3] = 0
  m[4] = 0
  m[5] = c
  m[6] = -s
  m[7] = 0
  m[8] = 0
  m[9] = s
  m[10] = c
  m[11] = 0
}

function setRotY(m: Mat, a: number): void {
  const c = Math.cos(a)
  const s = Math.sin(a)
  m[0] = c
  m[1] = 0
  m[2] = s
  m[3] = 0
  m[4] = 0
  m[5] = 1
  m[6] = 0
  m[7] = 0
  m[8] = -s
  m[9] = 0
  m[10] = c
  m[11] = 0
}

function setRotZ(m: Mat, a: number): void {
  const c = Math.cos(a)
  const s = Math.sin(a)
  m[0] = c
  m[1] = -s
  m[2] = 0
  m[3] = 0
  m[4] = s
  m[5] = c
  m[6] = 0
  m[7] = 0
  m[8] = 0
  m[9] = 0
  m[10] = 1
  m[11] = 0
}

/** `out = a · b`. `out` must not alias either input. */
function mul(out: Mat, a: Mat, b: Mat): void {
  for (let r = 0; r < 3; r++) {
    const r0 = a[r * 4]
    const r1 = a[r * 4 + 1]
    const r2 = a[r * 4 + 2]
    const t = a[r * 4 + 3]
    out[r * 4] = r0 * b[0] + r1 * b[4] + r2 * b[8]
    out[r * 4 + 1] = r0 * b[1] + r1 * b[5] + r2 * b[9]
    out[r * 4 + 2] = r0 * b[2] + r1 * b[6] + r2 * b[10]
    out[r * 4 + 3] = r0 * b[3] + r1 * b[7] + r2 * b[11] + t
  }
}

/**
 * Turns a rotation into the same rotation taken about a pivot rather than the
 * origin — `T(p) · R · T(−p)`, which for a pure rotation is just `R` with a
 * translation of `p − R·p`.
 */
function aboutPivot(out: Mat, r: Mat, px: number, py: number, pz: number): void {
  for (let i = 0; i < 12; i++) out[i] = r[i]
  out[3] = px - (r[0] * px + r[1] * py + r[2] * pz)
  out[7] = py - (r[4] * px + r[5] * py + r[6] * pz)
  out[11] = pz - (r[8] * px + r[9] * py + r[10] * pz)
}

/* ---- palette ---------------------------------------------------------- */

function parseColor(value: string): [number, number, number] {
  const found = value.match(/-?[\d.]+/g)
  if (!found || found.length < 3) return [255, 255, 255]
  return [Number(found[0]), Number(found[1]), Number(found[2])]
}

/**
 * Reads the theme's tokens once and bakes every material x shade into a packed
 * `uint32` the rasteriser can drop straight into the buffer.
 *
 * The read has to go through a real element in the document: `getComputedStyle`
 * on a custom property hands back the token *unresolved*, so asking for
 * `color-mix(in oklab, var(--color-lime) 82%, …)` that way returns the literal
 * string. Setting `color` on a throwaway node and reading it back gets a
 * resolved `rgb(...)` instead, and the mix is then done here in JS.
 */
export function resolvePalette(host: HTMLElement): Uint32Array {
  const probe = document.createElement('span')
  // Rendered but invisible. A `display: none` node is not guaranteed to resolve
  // an inherited colour on every engine, and this read has to be exact.
  probe.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none'
  host.appendChild(probe)

  const read = (token: string): [number, number, number] => {
    probe.style.color = `var(${token})`
    return parseColor(getComputedStyle(probe).color)
  }

  const background = read('--color-background')
  const palette = new Uint32Array(materialCount * shadeCount)

  for (let m = 0; m < materialCount; m++) {
    const spec = materialTokens[m]
    const base = read(spec.token)
    const k = spec.mix ?? 0
    const flat = flatMaterials.includes(m)

    for (let shade = 0; shade < shadeCount; shade++) {
      // Flat materials are marks on a face, not surfaces, so they take the top
      // band whatever direction they happen to be pointing.
      const level = flat ? shades[0] : shades[shade]
      let out = 0xff000000
      for (let c = 0; c < 3; c++) {
        const mixed = base[c] + (background[c] - base[c]) * k
        const v = Math.max(0, Math.min(255, Math.round(mixed * level)))
        // ImageData is little-endian RGBA, so a uint32 packs as 0xAABBGGRR.
        out |= v << (c * 8)
      }
      palette[m * shadeCount + shade] = out >>> 0
    }
  }

  probe.remove()
  return palette
}

/* ---- shading ---------------------------------------------------------- */

/**
 * Four hard bands, no interpolation. As she turns, each face *pops* from one
 * band to the next instead of gliding — and that quantisation is precisely
 * what keeps a rotating solid reading as pixel art rather than as a smoothly
 * shaded 3D toy.
 */
const shades = [1, 0.82, 0.63, 0.45]
const bands = [0.62, 0.35, 0]

const lightLen = Math.hypot(0.75, 1, 0.3)
const lightX = 0.75 / lightLen
const lightY = 1 / lightLen
const lightZ = 0.3 / lightLen

function shadeOf(nx: number, ny: number, nz: number): number {
  const d = nx * lightX + ny * lightY + nz * lightZ
  if (d > bands[0]) return 0
  if (d > bands[1]) return 1
  if (d > bands[2]) return 2
  return 3
}

/* ---- projection ------------------------------------------------------- */

const cosPitch = Math.cos(cameraPitch)
const sinPitch = Math.sin(cameraPitch)

/** Direction from the scene towards the camera; a face facing it is visible. */
const camY = sinPitch
const camZ = cosPitch

/* ---- face pool -------------------------------------------------------- */

const maxFaces = 128

/** Screen-space quads, four `x`/`y` pairs each, flat for the cache's sake. */
const faceX = new Float64Array(maxFaces * 4)
const faceY = new Float64Array(maxFaces * 4)
const faceDepth = new Float64Array(maxFaces)
const faceColor = new Uint32Array(maxFaces)
const order: number[] = []

let faceCount = 0

function byDepth(a: number, b: number): number {
  return faceDepth[a] - faceDepth[b]
}

/**
 * Below this, in buffer px, a quad is a sliver rather than a surface. Areas
 * shrink with `projScale²`, so this is pinned to it too — tuned at the
 * original `1.32` buffer-px-per-unit and carried to whatever scale she is
 * currently drawn at, rather than silently going stale (and eating thin faces
 * like the ears and tail) the next time she is resized.
 */
const minFaceArea = 0.35 * (projScale / 1.32) ** 2

/** The eight box corners, transformed to world space, reused per box. */
const cornerX = new Float64Array(8)
const cornerY = new Float64Array(8)
const cornerZ = new Float64Array(8)

/**
 * Corner indices per face, wound as a simple cycle. Bit 2 is `x`, bit 1 is
 * `y`, bit 0 is `z`; a set bit means the positive side.
 */
const faceCorners = [
  [4, 5, 7, 6], // +X
  [0, 2, 3, 1], // -X
  [2, 3, 7, 6], // +Y
  [0, 4, 5, 1], // -Y
  [1, 5, 7, 3], // +Z
  [0, 2, 6, 4], // -Z
]

function emitBox(m: Mat, box: Box, palette: Uint32Array): void {
  emitAt(m, box.cx, box.cy, box.cz, box.sx, box.sy, box.sz, box.material, palette)
}

function emitAt(
  m: Mat,
  cx: number,
  cy: number,
  cz: number,
  sx: number,
  sy: number,
  sz: number,
  material: number,
  palette: Uint32Array,
): void {
  const hx = sx / 2
  const hy = sy / 2
  const hz = sz / 2

  for (let i = 0; i < 8; i++) {
    const lx = cx + (i & 4 ? hx : -hx)
    const ly = cy + (i & 2 ? hy : -hy)
    const lz = cz + (i & 1 ? hz : -hz)
    cornerX[i] = m[0] * lx + m[1] * ly + m[2] * lz + m[3]
    cornerY[i] = m[4] * lx + m[5] * ly + m[6] * lz + m[7]
    cornerZ[i] = m[8] * lx + m[9] * ly + m[10] * lz + m[11]
  }

  for (let f = 0; f < 6; f++) {
    // The face normal is a column of the rotation, signed by which side it is.
    const axis = f >> 1
    const sign = f & 1 ? -1 : 1
    const nx = m[axis] * sign
    const ny = m[4 + axis] * sign
    const nz = m[8 + axis] * sign

    // Back-face cull. Around half of every box is pointing away from us, and
    // the near faces are opaque, so there is nothing to be gained by keeping it.
    if (ny * camY + nz * camZ <= 0) continue
    if (faceCount >= maxFaces) return

    const quad = faceCorners[f]
    const base = faceCount * 4
    let depth = 0
    let area = 0

    for (let v = 0; v < 4; v++) {
      const c = quad[v]
      const wy = cornerY[c]
      const wz = cornerZ[c]
      faceX[base + v] = canvas.originX + cornerX[c] * projScale
      faceY[base + v] = canvas.groundY - (wy * cosPitch - wz * sinPitch) * projScale
      depth += wy * sinPitch + wz * cosPitch
    }

    for (let v = 0; v < 4; v++) {
      const w = (v + 1) & 3
      area += faceX[base + v] * faceY[base + w] - faceX[base + w] * faceY[base + v]
    }

    // `area` is the shoelace sum, i.e. twice the signed area. A face seen
    // almost edge-on covers a sliver of a pixel and, band-shaded, shows up as
    // a line of speckle along a silhouette. Not worth drawing.
    if (Math.abs(area) < minFaceArea * 2) continue

    faceDepth[faceCount] = depth / 4
    faceColor[faceCount] = palette[material * shadeCount + shadeOf(nx, ny, nz)]
    faceCount++
  }
}

/* ---- fill ------------------------------------------------------------- */

function fillFace(pixels: Uint32Array, index: number): void {
  const base = index * 4
  const x0 = faceX[base]
  const y0 = faceY[base]
  const x1 = faceX[base + 1]
  const y1 = faceY[base + 1]
  const x2 = faceX[base + 2]
  const y2 = faceY[base + 2]
  const x3 = faceX[base + 3]
  const y3 = faceY[base + 3]

  let minX = Math.floor(Math.min(x0, x1, x2, x3))
  let maxX = Math.ceil(Math.max(x0, x1, x2, x3))
  let minY = Math.floor(Math.min(y0, y1, y2, y3))
  let maxY = Math.ceil(Math.max(y0, y1, y2, y3))
  if (minX < 0) minX = 0
  if (minY < 0) minY = 0
  if (maxX > canvas.bufWidth) maxX = canvas.bufWidth
  if (maxY > canvas.bufHeight) maxY = canvas.bufHeight

  // Winding depends on which way the face is turned, so normalise the sign
  // rather than emitting every quad consistently — this is one multiply.
  const area = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0)
  const s = area < 0 ? -1 : 1
  const color = faceColor[index]

  for (let py = minY; py < maxY; py++) {
    const cy = py + 0.5
    const row = py * canvas.bufWidth
    for (let px = minX; px < maxX; px++) {
      const cx = px + 0.5
      // Pixel centre against all four edges. At this resolution the bounding
      // boxes are ten pixels across, so a scanline converter would only buy
      // edge cases.
      if (s * ((x1 - x0) * (cy - y0) - (y1 - y0) * (cx - x0)) < 0) continue
      if (s * ((x2 - x1) * (cy - y1) - (y2 - y1) * (cx - x1)) < 0) continue
      if (s * ((x3 - x2) * (cy - y2) - (y3 - y2) * (cx - x2)) < 0) continue
      if (s * ((x0 - x3) * (cy - y3) - (y0 - y3) * (cx - x3)) < 0) continue
      pixels[row + px] = color
    }
  }
}

/* ---- scratch ---------------------------------------------------------- */

const mWorld = mat4()
const mBody = mat4()
const mHead = mat4()
const mPart = mat4()
const t0 = mat4()
const t1 = mat4()
const t2 = mat4()
const t3 = mat4()

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value
}

/** Where a point in `m`'s local space lands in the buffer. */
function projectX(m: Mat, x: number, y: number, z: number): number {
  return canvas.originX + (m[0] * x + m[1] * y + m[2] * z + m[3]) * projScale
}

function projectY(m: Mat, x: number, y: number, z: number): number {
  const wy = m[4] * x + m[5] * y + m[6] * z + m[7]
  const wz = m[8] * x + m[9] * y + m[10] * z + m[11]
  return canvas.groundY - (wy * cosPitch - wz * sinPitch) * projScale
}

/** Filled in by `drawDog` so the brain can measure the cursor against her face. */
export interface HeadProbe {
  x: number
  y: number
}

/** Her head standing square, so the first frame has something sane to aim at. */
export function createHeadProbe(): HeadProbe {
  return {
    x: canvas.originX + skull.cx * projScale,
    y: canvas.groundY - skull.cy * cosPitch * projScale,
  }
}

/* ---- the draw --------------------------------------------------------- */

export function drawDog(
  pixels: Uint32Array,
  palette: Uint32Array,
  pose: DogPose,
  probe: HeadProbe,
): void {
  pixels.fill(0)
  faceCount = 0

  /* Root: yaw, then bank, then the lunge along her own nose and the vertical
     lift. The lunge lives inside the yaw so it always pushes the way she is
     facing rather than always to screen-right. */
  setRotY(t0, pose.yaw)
  setRotX(t1, pose.roll)
  mul(t2, t0, t1)
  t3[0] = 1
  t3[1] = 0
  t3[2] = 0
  t3[3] = pose.shift
  t3[4] = 0
  t3[5] = 1
  t3[6] = 0
  t3[7] = pose.lift
  t3[8] = 0
  t3[9] = 0
  t3[10] = 1
  t3[11] = 0
  mul(mWorld, t2, t3)

  /* Body: rear up about the hind feet, sit down about the front ones. Both are
     the same rotation about different pivots, which is exactly what they are. */
  setRotZ(t0, pose.rear)
  aboutPivot(t1, t0, pivots.rear.x, pivots.rear.y, pivots.rear.z)
  mul(t2, mWorld, t1)
  setRotZ(t0, pose.sit)
  aboutPivot(t1, t0, pivots.sit.x, pivots.sit.y, pivots.sit.z)
  mul(mBody, t2, t1)

  emitBox(mBody, torso, palette)

  /* Legs. */
  for (let i = 0; i < 4; i++) {
    const hip = hips[i]
    setRotZ(t0, pose.legs[i])
    aboutPivot(t1, t0, hip.x, hipY, hip.z)
    mul(mPart, mBody, t1)
    emitAt(mPart, hip.x, legShank.cy, hip.z, legShank.sx, legShank.sy, legShank.sz, mat.fur, palette)
    emitAt(mPart, hip.x, legPaw.cy, hip.z, legPaw.sx, legPaw.sy, legPaw.sz, mat.paw, palette)
  }

  /* Tail: yaw is the wag, and the lift brings it upright. */
  setRotY(t0, pose.tailYaw)
  setRotZ(t1, -pose.tailLift)
  mul(t2, t0, t1)
  aboutPivot(t3, t2, pivots.tail.x, pivots.tail.y, pivots.tail.z)
  mul(mPart, mBody, t3)
  emitBox(mPart, tailUpper, palette)
  emitBox(mPart, tailTip, palette)

  /* Head. */
  setRotY(t0, pose.headYaw)
  setRotZ(t1, pose.headPitch)
  mul(t2, t0, t1)
  aboutPivot(t3, t2, pivots.head.x, pivots.head.y, pivots.head.z)
  mul(mHead, mBody, t3)

  emitBox(mHead, skull, palette)
  emitBox(mHead, snout, palette)
  emitBox(mHead, nose, palette)

  probe.x = projectX(mHead, skull.cx, skull.cy, skull.cz)
  probe.y = projectY(mHead, skull.cx, skull.cy, skull.cz)

  /* Ears. `rotZ` swings them forward, and a touch of `rotX` splays an alert
     ear outwards — the two together are the difference between "listening"
     and "a flap rotated a few degrees". */
  for (let s = 0; s < 2; s++) {
    const side = s === 0 ? 1 : -1
    const angle = s === 0 ? pose.earLeft : pose.earRight
    setRotZ(t0, angle)
    setRotX(t1, -side * angle * 0.35)
    mul(t2, t0, t1)
    aboutPivot(t3, t2, pivots.ear.x, pivots.ear.y, side * pivots.ear.z)
    mul(mPart, mHead, t3)
    emitAt(mPart, ear.cx, ear.cy, side * ear.cz, ear.sx, ear.sy, ear.sz, mat.ear, palette)
  }

  /* Eyes. */
  const open = 1 - pose.blink * 0.94
  const plateH = eye.sy * open
  // The lid falls from the top, so the plate shrinks about its bottom edge.
  const plateY = -eye.sy / 2 + plateH / 2

  for (let s = 0; s < 2; s++) {
    const side = s === 0 ? 1 : -1
    setRotY(t0, -side * eye.splay)
    t0[3] = eye.cx
    t0[7] = eye.cy
    t0[11] = side * eye.cz
    mul(mPart, mHead, t0)

    emitAt(mPart, 0, plateY, 0, eye.sx, plateH, eye.sz, mat.eye, palette)

    // Which way the plate's local +Z leans on screen decides which way a pupil
    // has to slide to look like it is following the cursor. Fading the term out
    // as the plate turns edge-on keeps it from snapping when the sign flips.
    const lean = clamp(mPart[2] * 2, -1, 1)
    const pupilZ = clamp(pose.lookX, -1, 1) * eye.travel * lean
    const room = Math.max(0, (plateH - eye.pupil.sy) / 2)
    const pupilY = plateY + clamp(-clamp(pose.lookY, -1, 1) * eye.travel, -room, room)

    if (plateH > eye.pupil.sy * 0.5) {
      emitAt(
        mPart,
        eye.pupil.out,
        pupilY,
        pupilZ,
        eye.pupil.sx,
        Math.min(eye.pupil.sy, plateH),
        eye.pupil.sz,
        mat.pupil,
        palette,
      )
    }
  }

  /* Painter's algorithm, far to near. Correct here because the parts are
     separated solids: the far legs sort behind the torso and the near ones in
     front of it, which is the only ordering that ever actually matters.
     `Array.sort` is stable, so faces at equal depth keep emission order. */
  order.length = faceCount
  for (let i = 0; i < faceCount; i++) order[i] = i
  order.sort(byDepth)
  for (let i = 0; i < faceCount; i++) fillFace(pixels, order[i])
}
