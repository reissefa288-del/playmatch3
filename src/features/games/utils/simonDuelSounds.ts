import type { PadId } from './simonDuelEngine'

export type SimonSoundId =
  | 'pad0'
  | 'pad1'
  | 'pad2'
  | 'pad3'
  | 'wrong'
  | 'score'
  | 'combo'
  | 'legWin'
  | 'legLose'
  | 'matchWin'
  | 'matchLose'
  | 'start'

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

export function unlockSimonDuelAudio() {
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

const PAD_FREQ: Record<PadId, number> = {
  0: 440,
  1: 554,
  2: 659,
  3: 880,
}

const lastPlayed: Partial<Record<SimonSoundId, number>> = {}
const MIN_GAP_MS: Partial<Record<SimonSoundId, number>> = {
  pad0: 80,
  pad1: 80,
  pad2: 80,
  pad3: 80,
  wrong: 220,
  score: 180,
  combo: 220,
  legWin: 700,
  legLose: 700,
  matchWin: 900,
  matchLose: 900,
  start: 500,
}

export function playSimonPadSound(pad: PadId) {
  playSimonDuelSound(`pad${pad}` as SimonSoundId)
}

export function playSimonDuelSound(id: SimonSoundId) {
  const now = performance.now()
  const gap = MIN_GAP_MS[id] ?? 60
  if (lastPlayed[id] && now - lastPlayed[id]! < gap) return
  lastPlayed[id] = now

  switch (id) {
    case 'pad0':
      tone(PAD_FREQ[0], 0.16, 'sine', 0.07, PAD_FREQ[0] * 0.92)
      tone(PAD_FREQ[0] * 2, 0.08, 'triangle', 0.022, undefined, 0.02)
      break
    case 'pad1':
      tone(PAD_FREQ[1], 0.16, 'sine', 0.07, PAD_FREQ[1] * 0.92)
      tone(PAD_FREQ[1] * 1.5, 0.08, 'triangle', 0.022, undefined, 0.02)
      break
    case 'pad2':
      tone(PAD_FREQ[2], 0.16, 'sine', 0.07, PAD_FREQ[2] * 0.92)
      tone(PAD_FREQ[2] * 1.5, 0.08, 'triangle', 0.022, undefined, 0.02)
      break
    case 'pad3':
      tone(PAD_FREQ[3], 0.16, 'sine', 0.07, PAD_FREQ[3] * 0.92)
      tone(PAD_FREQ[3] * 1.5, 0.07, 'triangle', 0.02, undefined, 0.02)
      break
    case 'wrong':
      tone(180, 0.12, 'sawtooth', 0.06, 90)
      tone(120, 0.16, 'square', 0.045, 70, 0.08)
      break
    case 'score':
      tone(660, 0.08, 'sine', 0.055)
      tone(880, 0.1, 'triangle', 0.048, undefined, 0.07)
      tone(1040, 0.12, 'sine', 0.038, undefined, 0.14)
      break
    case 'combo':
      tone(740, 0.07, 'square', 0.05)
      tone(988, 0.09, 'square', 0.048, undefined, 0.06)
      tone(1174, 0.11, 'triangle', 0.042, undefined, 0.12)
      tone(1318, 0.14, 'sine', 0.035, undefined, 0.18)
      break
    case 'legWin':
      tone(523, 0.1, 'sine', 0.06)
      tone(659, 0.1, 'sine', 0.055, undefined, 0.1)
      tone(784, 0.14, 'triangle', 0.05, undefined, 0.2)
      break
    case 'legLose':
      tone(330, 0.14, 'sawtooth', 0.05, 220)
      tone(247, 0.18, 'sine', 0.04, 180, 0.1)
      break
    case 'matchWin':
      tone(523, 0.1, 'sine', 0.06)
      tone(659, 0.1, 'sine', 0.055, undefined, 0.1)
      tone(784, 0.12, 'sine', 0.05, undefined, 0.2)
      tone(988, 0.16, 'triangle', 0.045, undefined, 0.32)
      break
    case 'matchLose':
      tone(220, 0.18, 'sawtooth', 0.05, 110)
      break
    case 'start':
      tone(392, 0.08, 'sine', 0.045, 784)
      tone(784, 0.1, 'triangle', 0.038, undefined, 0.07)
      break
    default:
      break
  }
}
