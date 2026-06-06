export type SliceSoundId = 'slice' | 'star' | 'bomb' | 'ko' | 'miss' | 'combo' | 'frenzy' | 'legWin' | 'legLose' | 'matchWin' | 'matchLose' | 'start'

let audioCtx: AudioContext | null = null
let unlocked = false

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
  }
  return audioCtx
}

export function unlockSliceDuelAudio() {
  const ctx = getCtx()
  if (!ctx || unlocked) return
  unlocked = true
  if (ctx.state === 'suspended') void ctx.resume()
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  gain: number,
  slideTo?: number,
  delay = 0,
) {
  const ctx = getCtx()
  if (!ctx || !unlocked) return
  if (ctx.state === 'suspended') {
    void ctx.resume().then(() => tone(freq, duration, type, gain, slideTo, delay))
    return
  }
  const t0 = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(24, slideTo), t0 + duration)
  amp.gain.setValueAtTime(gain, t0)
  amp.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  osc.connect(amp)
  amp.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

const lastPlayed: Partial<Record<SliceSoundId, number>> = {}
const MIN_GAP: Partial<Record<SliceSoundId, number>> = {
  slice: 45,
  star: 90,
  bomb: 280,
  ko: 600,
  miss: 200,
  combo: 160,
  frenzy: 700,
  legWin: 700,
  legLose: 700,
  matchWin: 900,
  matchLose: 900,
  start: 500,
}

export function playSliceDuelSound(id: SliceSoundId) {
  const now = performance.now()
  const gap = MIN_GAP[id] ?? 60
  if (lastPlayed[id] && now - lastPlayed[id]! < gap) return
  lastPlayed[id] = now

  switch (id) {
    case 'slice':
      tone(520, 0.06, 'triangle', 0.05, 780)
      break
    case 'star':
      tone(880, 0.08, 'sine', 0.055, 1320)
      tone(1100, 0.1, 'triangle', 0.038, undefined, 0.05)
      break
    case 'bomb':
      tone(120, 0.14, 'sawtooth', 0.07, 55)
      tone(80, 0.18, 'square', 0.05, 40, 0.06)
      break
    case 'ko':
      tone(220, 0.16, 'sawtooth', 0.06, 90)
      tone(160, 0.22, 'sine', 0.045, 70, 0.1)
      break
    case 'miss':
      tone(280, 0.1, 'sine', 0.035, 180)
      break
    case 'combo':
      tone(660, 0.07, 'square', 0.048)
      tone(880, 0.09, 'triangle', 0.042, undefined, 0.06)
      break
    case 'frenzy':
      tone(440, 0.08, 'sawtooth', 0.05, 880)
      tone(660, 0.1, 'square', 0.048, undefined, 0.07)
      tone(880, 0.12, 'triangle', 0.042, undefined, 0.14)
      break
    case 'legWin':
      tone(523, 0.1, 'sine', 0.06)
      tone(784, 0.14, 'sine', 0.05, undefined, 0.12)
      break
    case 'legLose':
      tone(330, 0.14, 'sawtooth', 0.045, 220)
      break
    case 'matchWin':
      tone(523, 0.1, 'sine', 0.06)
      tone(659, 0.1, 'sine', 0.05, undefined, 0.1)
      tone(784, 0.16, 'triangle', 0.045, undefined, 0.2)
      break
    case 'matchLose':
      tone(220, 0.18, 'sawtooth', 0.05, 110)
      break
    case 'start':
      tone(440, 0.08, 'triangle', 0.045, 880)
      break
    default:
      break
  }
}
