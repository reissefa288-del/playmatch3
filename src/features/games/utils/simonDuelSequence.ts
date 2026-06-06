import {
  MAX_SEQ_LEN,
  START_SEQ_LEN,
  type PadId,
} from './simonDuelEngine'

export const RECENT_SEQUENCE_CAP = 36

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

/** Her round için taze, tahmin edilmesi zor entropy */
export function createSimonRand(): () => number {
  const seeds = new Uint32Array(4)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(seeds)
  } else {
    for (let i = 0; i < 4; i++) seeds[i] = (Math.random() * 0xffffffff) >>> 0
  }
  seeds[0] ^= (Date.now() >>> 0) ^ ((performance.now() * 1000) >>> 0)
  seeds[1] ^= seeds[0] ^ 0x9e3779b9
  const streams = [0, 1, 2, 3].map((i) => mulberry32(seeds[i]!))
  let pick = 0
  return () => {
    const stream = streams[pick % 4]!
    pick += 1
    return stream()
  }
}

export function sequenceKey(seq: PadId[]): string {
  return seq.join('')
}

function isMemorizablePattern(seq: PadId[]): boolean {
  if (seq.length < 2) return false

  if (seq.every((p) => p === seq[0])) return true

  if (seq.length >= 4) {
    const a = seq[0]!
    const b = seq[1]!
    if (seq.every((p, i) => p === (i % 2 === 0 ? a : b))) return true
  }

  const isStep = (step: 1 | -1) => {
    for (let i = 1; i < seq.length; i++) {
      const want = ((seq[i - 1]! + step + 4) % 4) as PadId
      if (seq[i] !== want) return false
    }
    return true
  }
  if (seq.length >= 4 && (isStep(1) || isStep(-1))) return true

  const counts = [0, 0, 0, 0]
  for (const p of seq) counts[p] += 1
  const used = counts.filter((c) => c > 0).length
  if (seq.length >= 4 && used <= 2) return true

  return false
}

function pickLength(base: number, rand: () => number): number {
  const jitter = rand() < 0.42 ? (rand() < 0.5 ? -1 : 1) : 0
  return Math.max(START_SEQ_LEN, Math.min(MAX_SEQ_LEN, base + jitter))
}

function buildSequence(length: number, rand: () => number): PadId[] {
  const seq: PadId[] = []
  for (let i = 0; i < length; i++) {
    let pad: PadId
    let guard = 0
    do {
      pad = Math.floor(rand() * 4) as PadId
      guard += 1
    } while (guard < 14 && i >= 2 && pad === seq[i - 1] && pad === seq[i - 2])
    seq.push(pad)
  }
  return seq
}

export function rememberSequence(recent: Set<string>, seq: PadId[]) {
  recent.add(sequenceKey(seq))
  if (recent.size <= RECENT_SEQUENCE_CAP) return
  const drop = recent.values().next().value
  if (drop) recent.delete(drop)
}

export function generateVariedSequence(
  baseLength: number,
  rand: () => number,
  recent: Set<string>,
): PadId[] {
  const length = pickLength(baseLength, rand)

  for (let attempt = 0; attempt < 72; attempt++) {
    const seq = buildSequence(length, rand)
    const key = sequenceKey(seq)
    if (!recent.has(key) && !isMemorizablePattern(seq)) return seq
  }

  for (let attempt = 0; attempt < 24; attempt++) {
    const seq = buildSequence(length, () => Math.random())
    const key = sequenceKey(seq)
    if (!recent.has(key) && !isMemorizablePattern(seq)) return seq
  }

  return buildSequence(length, () => Math.random())
}
